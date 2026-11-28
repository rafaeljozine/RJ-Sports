/* ==========================================================
   Encomendas: criação a partir do checkout, consulta pública
   ("Acompanhar encomenda") e atualização pelo painel.
   Os preços são SEMPRE calculados aqui, a partir da base de
   dados — nunca se confia nos preços enviados pelo navegador.
   ========================================================== */

const prisma = require("../config/database");
const { erros } = require("../utils/erros");
const { normalizarTelefone, formatarTelefone, gerarNumero, lista } = require("../utils/formatos");
const { encomendaParaApi } = require("../utils/mapeadores");
const descontos = require("./descontoService");
const LimiteStore = require("../utils/limiteStore");

// contra encomendas falsas em massa: no máximo 5 por telefone a cada 24 horas
const ENCOMENDAS_POR_TELEFONE = 5;
const porTelefone = new LimiteStore("encomenda-telefone");
porTelefone.init({ windowMs: 24 * 60 * 60 * 1000 });

const INCLUIR = { itens: true, historico: true };

async function numeroUnico() {
  for (let i = 0; i < 20; i++) {
    const numero = gerarNumero();
    const existe = await prisma.encomenda.findUnique({ where: { numero }, select: { numero: true } });
    if (!existe) return numero;
  }
  throw new Error("Não foi possível gerar um número de encomenda.");
}

/** Cria uma encomenda vinda do checkout da loja */
async function criarDoCheckout(dados) {
  const c = dados.cliente;
  const telefone = normalizarTelefone(c.telefone);
  if (!telefone) throw erros.pedidoInvalido("Número de telefone inválido. Ex.: 84 123 4567");
  let telefone2 = null;
  if (c.telefone2) {
    const t2 = normalizarTelefone(c.telefone2);
    if (!t2) throw erros.pedidoInvalido("O outro contacto é inválido.");
    telefone2 = formatarTelefone(t2);
  }

  const contagem = await porTelefone.increment(telefone);
  if (contagem.totalHits > ENCOMENDAS_POR_TELEFONE) {
    throw erros.pedidoInvalido("Já recebemos várias encomendas deste número hoje. Para mais, fale connosco pelo WhatsApp.");
  }

  // Zona de entrega
  const zona = await prisma.zona.findUnique({ where: { provincia: c.provincia } });
  if (zona && zona.ativa === false) {
    throw erros.pedidoInvalido("Ainda não fazemos entregas em " + c.provincia + ". Fale connosco pelo WhatsApp.");
  }

  // Produtos e preços a partir da base de dados
  const ids = [...new Set(dados.itens.map((i) => i.id))];
  const produtos = await prisma.produto.findMany({ where: { id: { in: ids }, ativo: true } });
  const porId = Object.fromEntries(produtos.map((p) => [p.id, p]));

  const itens = dados.itens.map((i) => {
    const p = porId[i.id];
    if (!p) throw erros.pedidoInvalido("Um dos produtos já não está disponível. Atualize o carrinho.");
    const tamanhos = lista(p.tamanhos);
    const tamanho = i.tamanho || "";
    if (tamanhos.length && !tamanhos.includes(tamanho)) {
      throw erros.pedidoInvalido("Escolha um tamanho válido para " + p.nome + ".");
    }
    return {
      produtoId: p.id,
      nome: p.nome,
      tamanho: tamanhos.length ? tamanho : null,
      quantidade: i.quantidade,
      preco: p.preco,
      custo: p.custo,
      subtotal: p.preco * i.quantidade
    };
  });

  const subtotal = itens.reduce((s, i) => s + i.subtotal, 0);
  // Código de desconto: validado e calculado de novo aqui
  const cupao = dados.codigo ? await descontos.calcular(dados.codigo, subtotal) : null;
  const total = subtotal - (cupao ? cupao.desconto : 0);
  const numero = await numeroUnico();

  const encomenda = await prisma.encomenda.create({
    data: {
      numero,
      clienteNome: c.nome,
      clienteTelefone: formatarTelefone(telefone),
      clienteTelefone2: telefone2,
      provincia: c.provincia,
      cidade: c.cidade,
      bairro: c.bairro,
      endereco: c.endereco,
      observacoes: c.observacoes || null,
      pagamento: dados.pagamento,
      total,
      desconto: cupao ? cupao.desconto : null,
      codigoDesconto: cupao ? cupao.codigo : null,
      taxaEntrega: zona && zona.taxa != null ? zona.taxa : null,
      itens: { create: itens },
      historico: { create: [{ estado: "Recebida", nota: "Encomenda feita no site" }] }
    },
    include: INCLUIR
  });

  return encomendaParaApi(encomenda, { publico: true });
}

/** Consulta pública: só devolve a encomenda se o telefone coincidir */
async function consultarPublica(numero, telefone) {
  const tel = normalizarTelefone(telefone);
  const enc = tel && /^RJS-\d{6}$/.test(numero)
    ? await prisma.encomenda.findUnique({ where: { numero }, include: INCLUIR })
    : null;
  // a mesma resposta para "não existe" e "telefone errado"
  if (!enc || normalizarTelefone(enc.clienteTelefone) !== tel) {
    throw erros.naoEncontrado("Encomenda não encontrada. Confirme o número e o telefone.");
  }
  return encomendaParaApi(enc, { publico: true });
}

async function listar() {
  const encomendas = await prisma.encomenda.findMany({ include: INCLUIR, orderBy: { data: "desc" } });
  return encomendas.map((e) => encomendaParaApi(e));
}

/** Atualização pelo painel: estado, taxa, notas, histórico */
async function atualizar(numero, dados) {
  const existe = await prisma.encomenda.findUnique({ where: { numero }, select: { numero: true } });
  if (!existe) throw erros.naoEncontrado("Encomenda não encontrada.");

  const operacoes = [
    prisma.encomenda.update({
      where: { numero },
      data: {
        estado: dados.estado,
        taxaEntrega: dados.taxaEntrega == null ? null : dados.taxaEntrega,
        pedidoFornecedor: !!dados.pedidoFornecedor,
        notas: dados.notas || null
      }
    })
  ];
  if (dados.historico) {
    operacoes.push(prisma.historicoEstado.deleteMany({ where: { encomendaNumero: numero } }));
    operacoes.push(prisma.historicoEstado.createMany({
      data: dados.historico.map((h) => ({ encomendaNumero: numero, estado: h.estado, data: new Date(h.data), nota: h.nota || null }))
    }));
  }
  await prisma.$transaction(operacoes);
  const enc = await prisma.encomenda.findUnique({ where: { numero }, include: INCLUIR });
  return encomendaParaApi(enc);
}

async function apagar(numero) {
  await prisma.encomenda.delete({ where: { numero } });
}

/** Clientes agrupados pelo telefone, a partir das encomendas */
async function clientes() {
  const encomendas = await prisma.encomenda.findMany({ orderBy: { data: "asc" } });
  const mapa = new Map();
  for (const e of encomendas) {
    const chave = normalizarTelefone(e.clienteTelefone) || e.clienteNome;
    const c = mapa.get(chave) || {
      nome: e.clienteNome, telefone: e.clienteTelefone, provincia: e.provincia, cidade: e.cidade,
      encomendas: 0, canceladas: 0, gasto: 0, primeira: e.data, ultima: e.data
    };
    c.encomendas++;
    if (e.estado === "Cancelada") c.canceladas++;
    else c.gasto += e.total;
    c.ultima = e.data;
    c.nome = e.clienteNome;
    c.provincia = e.provincia;
    c.cidade = e.cidade;
    mapa.set(chave, c);
  }
  return [...mapa.values()].sort((a, b) => b.ultima - a.ultima);
}

module.exports = { criarDoCheckout, consultarPublica, listar, atualizar, apagar, clientes };
