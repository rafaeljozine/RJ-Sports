/* ==========================================================
   Painel: fotografia completa dos dados (para o painel abrir
   de uma vez) e reposição a partir de uma cópia de segurança.
   ========================================================== */

const prisma = require("../config/database");
const { produtoParaApi, produtoParaBd, simples } = require("../utils/mapeadores");
const { normalizarTelefone, formatarTelefone } = require("../utils/formatos");
const encomendaService = require("./encomendaService");
const { obterConfiguracaoLoja, guardarConfiguracaoLoja } = require("./lojaService");

/** Todos os dados do painel, no mesmo formato que o painel usa */
async function fotografia(admin) {
  const [produtos, categorias, fornecedores, zonas, campanhas, despesas, encomendas, loja] = await Promise.all([
    prisma.produto.findMany({ orderBy: { criadoEm: "asc" } }),
    prisma.categoria.findMany({ orderBy: [{ ordem: "asc" }, { nome: "asc" }] }),
    prisma.fornecedor.findMany({ orderBy: { nome: "asc" } }),
    prisma.zona.findMany(),
    prisma.campanha.findMany(),
    prisma.despesa.findMany({ orderBy: { data: "desc" } }),
    encomendaService.listar(),
    obterConfiguracaoLoja()
  ]);

  return {
    conta: { nome: admin.nome, email: admin.email, inicial: admin.inicial },
    db: {
      versao: 1,
      origem: "api",
      produtos: produtos.map((p) => produtoParaApi(p)),
      categorias: categorias.map(simples.categorias.paraApi),
      fornecedores: fornecedores.map(simples.fornecedores.paraApi),
      zonas: zonas.map(simples.zonas.paraApi),
      campanhas: campanhas.map(simples.campanhas.paraApi),
      despesas: despesas.map(simples.despesas.paraApi),
      encomendas,
      loja
    }
  };
}

/** Substitui TODOS os dados pelos de uma cópia de segurança do painel */
async function importar(copia) {
  const num = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Math.round(Number(v)));

  await prisma.$transaction(async (tx) => {
    await tx.historicoEstado.deleteMany();
    await tx.encomendaItem.deleteMany();
    await tx.encomenda.deleteMany();
    await tx.produto.deleteMany();
    await tx.categoria.deleteMany();
    await tx.fornecedor.deleteMany();
    await tx.zona.deleteMany();
    await tx.campanha.deleteMany();
    await tx.despesa.deleteMany();

    for (const [i, c] of (copia.categorias || []).entries()) {
      await tx.categoria.create({ data: Object.assign({ id: c.id, ordem: i }, simples.categorias.paraBd(c)) });
    }
    for (const f of copia.fornecedores || []) {
      await tx.fornecedor.create({ data: Object.assign({ id: f.id }, simples.fornecedores.paraBd(f)) });
    }
    const fornecedoresIds = new Set((copia.fornecedores || []).map((f) => f.id));
    for (const p of copia.produtos || []) {
      const dados = produtoParaBd(Object.assign({}, p, {
        preco: num(p.preco) || 1, precoAntigo: num(p.precoAntigo), custo: num(p.custo), stock: num(p.stock) || 0
      }));
      if (dados.fornecedorId && !fornecedoresIds.has(dados.fornecedorId)) dados.fornecedorId = null;
      await tx.produto.create({ data: Object.assign({ id: p.id }, dados) });
    }
    for (const z of copia.zonas || []) {
      await tx.zona.create({ data: Object.assign({ id: z.id }, simples.zonas.paraBd(Object.assign({}, z, { taxa: num(z.taxa) }))) });
    }
    for (const c of copia.campanhas || []) {
      await tx.campanha.create({ data: Object.assign({ id: c.id }, simples.campanhas.paraBd(Object.assign({}, c, { valor: num(c.valor) || 1, minimo: num(c.minimo) }))) });
    }
    for (const d of copia.despesas || []) {
      await tx.despesa.create({ data: Object.assign({ id: d.id }, simples.despesas.paraBd(Object.assign({}, d, { valor: num(d.valor) || 0 }))) });
    }
    for (const e of copia.encomendas || []) {
      const c = e.cliente || {};
      const tel = normalizarTelefone(c.telefone);
      await tx.encomenda.create({
        data: {
          numero: e.numero,
          data: new Date(e.data),
          estado: e.estado,
          clienteNome: c.nome || "—",
          clienteTelefone: tel ? formatarTelefone(tel) : String(c.telefone || ""),
          clienteTelefone2: c.telefone2 || null,
          provincia: c.provincia || "",
          cidade: c.cidade || "",
          bairro: c.bairro || "",
          endereco: c.endereco || "",
          observacoes: c.observacoes || null,
          pagamento: e.pagamento || "Numerário",
          total: num(e.total) || 0,
          taxaEntrega: num(e.taxaEntrega),
          pedidoFornecedor: !!e.pedidoFornecedor,
          notas: e.notas || null,
          itens: {
            create: (e.itens || []).map((i) => ({
              produtoId: i.id || null, nome: i.nome, tamanho: i.tamanho || null,
              quantidade: num(i.quantidade) || 1, preco: num(i.preco) || 0, custo: num(i.custo), subtotal: num(i.subtotal) || 0
            }))
          },
          historico: {
            create: (e.historico || []).map((h) => ({ estado: h.estado, data: new Date(h.data), nota: h.nota || null }))
          }
        }
      });
    }
  }, { timeout: 60000 });

  if (copia.loja) await guardarConfiguracaoLoja(copia.loja);
}

module.exports = { fotografia, importar };
