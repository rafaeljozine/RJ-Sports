/* ==========================================================
   Conversão entre o formato da base de dados e o formato
   usado pelo site e pelo painel (o mesmo de js/produtos.js)
   ========================================================== */

const { lista } = require("./formatos");

const semNulos = (obj) => {
  Object.keys(obj).forEach((k) => obj[k] === null && delete obj[k]);
  return obj;
};

/* ---------- Produtos ---------- */
function produtoParaApi(p, { publico = false } = {}) {
  const r = {
    id: p.id,
    sku: p.sku || "",
    nome: p.nome,
    categoria: p.categoriaId,
    descricao: p.descricao || "",
    preco: p.preco,
    precoAntigo: p.precoAntigo,
    custo: p.custo,
    stock: p.stock,
    fornecedorId: p.fornecedorId || "",
    imagem: p.imagem || "",
    tamanhos: lista(p.tamanhos),
    publico: lista(p.publico),
    idades: lista(p.idades),
    destaque: p.destaque,
    novo: p.novo,
    ativo: p.ativo
  };
  if (publico) {
    // dados internos não vão para a loja
    delete r.custo;
    delete r.fornecedorId;
    delete r.sku;
    delete r.ativo;
  }
  if (r.precoAntigo == null) delete r.precoAntigo;
  return r;
}

function produtoParaBd(d) {
  return {
    sku: d.sku || null,
    nome: d.nome,
    descricao: d.descricao || null,
    categoriaId: d.categoria,
    preco: d.preco,
    precoAntigo: d.precoAntigo || null,
    custo: d.custo == null ? null : d.custo,
    stock: d.stock || 0,
    fornecedorId: d.fornecedorId || null,
    imagem: d.imagem || null,
    tamanhos: JSON.stringify(d.tamanhos || []),
    publico: JSON.stringify(d.publico || []),
    idades: JSON.stringify(d.idades || []),
    destaque: !!d.destaque,
    novo: !!d.novo,
    ativo: d.ativo !== false
  };
}

/* ---------- Encomendas ---------- */
function encomendaParaApi(e, { publico = false } = {}) {
  const r = {
    numero: e.numero,
    data: e.data.toISOString(),
    estado: e.estado,
    cliente: {
      nome: e.clienteNome,
      telefone: e.clienteTelefone,
      telefone2: e.clienteTelefone2 || "",
      provincia: e.provincia,
      cidade: e.cidade,
      bairro: e.bairro,
      endereco: e.endereco,
      observacoes: e.observacoes || ""
    },
    pagamento: e.pagamento,
    itens: (e.itens || []).map((i) => ({
      id: i.produtoId,
      nome: i.nome,
      tamanho: i.tamanho || "",
      quantidade: i.quantidade,
      preco: i.preco,
      custo: i.custo,
      subtotal: i.subtotal
    })),
    total: e.total,
    desconto: e.desconto || 0,
    codigoDesconto: e.codigoDesconto || "",
    taxaEntrega: e.taxaEntrega,
    pedidoFornecedor: e.pedidoFornecedor,
    notas: e.notas || "",
    historico: (e.historico || [])
      .slice()
      .sort((a, b) => a.data - b.data)
      .map((h) => ({ estado: h.estado, data: h.data.toISOString(), nota: h.nota || "" }))
  };
  if (publico) {
    delete r.notas;
    delete r.pedidoFornecedor;
    r.itens.forEach((i) => delete i.custo);
    r.historico.forEach((h) => delete h.nota);
  }
  return r;
}

/* ---------- Coleções simples ---------- */
const simples = {
  categorias: {
    paraApi: (c) => semNulos({ id: c.id, nome: c.nome, descricao: c.descricao }),
    paraBd: (d) => ({ nome: d.nome, descricao: d.descricao || null })
  },
  fornecedores: {
    paraApi: (f) => ({
      id: f.id, nome: f.nome, contacto: f.contacto || "", telefone: f.telefone || "", email: f.email || "",
      cidade: f.cidade || "", prazo: f.prazo || "", notas: f.notas || ""
    }),
    paraBd: (d) => ({
      nome: d.nome, contacto: d.contacto || null, telefone: d.telefone || null, email: d.email || null,
      cidade: d.cidade || null, prazo: d.prazo || null, notas: d.notas || null
    })
  },
  zonas: {
    paraApi: (z) => ({ id: z.id, provincia: z.provincia, taxa: z.taxa, prazo: z.prazo || "", ativa: z.ativa }),
    paraBd: (d) => ({ provincia: d.provincia, taxa: d.taxa == null ? null : d.taxa, prazo: d.prazo || null, ativa: d.ativa !== false })
  },
  campanhas: {
    paraApi: (c) => ({
      id: c.id, nome: c.nome, codigo: c.codigo || "", tipo: c.tipo, valor: c.valor, minimo: c.minimo,
      inicio: c.inicio || "", fim: c.fim || "", ativa: c.ativa
    }),
    paraBd: (d) => ({
      nome: d.nome, codigo: d.codigo ? d.codigo.toUpperCase() : null, tipo: d.tipo || "percentagem", valor: d.valor,
      minimo: d.minimo == null ? null : d.minimo, inicio: d.inicio || null, fim: d.fim || null, ativa: d.ativa !== false
    })
  },
  despesas: {
    paraApi: (x) => ({ id: x.id, data: x.data, descricao: x.descricao, categoria: x.categoria || "", valor: x.valor }),
    paraBd: (d) => ({ data: d.data, descricao: d.descricao, categoria: d.categoria || null, valor: d.valor })
  }
};

module.exports = { produtoParaApi, produtoParaBd, encomendaParaApi, simples };
