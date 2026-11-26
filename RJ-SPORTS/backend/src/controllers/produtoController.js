/* ==========================================================
   Produtos (loja e painel)
   ========================================================== */

const prisma = require("../config/database");
const { assincrono, erros } = require("../utils/erros");
const { produtoParaApi, produtoParaBd } = require("../utils/mapeadores");

async function verificarRelacoes(dados) {
  const categoria = await prisma.categoria.findUnique({ where: { id: dados.categoria } });
  if (!categoria) throw erros.pedidoInvalido("A categoria escolhida não existe.");
  if (dados.fornecedorId) {
    const fornecedor = await prisma.fornecedor.findUnique({ where: { id: dados.fornecedorId } });
    if (!fornecedor) throw erros.pedidoInvalido("O fornecedor escolhido não existe.");
  }
}

/* ---------- Loja (público) ---------- */
exports.listarPublico = assincrono(async (req, res) => {
  const produtos = await prisma.produto.findMany({ where: { ativo: true }, orderBy: { criadoEm: "asc" } });
  res.json(produtos.map((p) => produtoParaApi(p, { publico: true })));
});

exports.obterPublico = assincrono(async (req, res) => {
  const p = await prisma.produto.findFirst({ where: { id: req.params.id, ativo: true } });
  if (!p) throw erros.naoEncontrado("Produto não encontrado.");
  res.json(produtoParaApi(p, { publico: true }));
});

/* ---------- Painel ---------- */
exports.listar = assincrono(async (req, res) => {
  const produtos = await prisma.produto.findMany({ orderBy: { criadoEm: "asc" } });
  res.json(produtos.map((p) => produtoParaApi(p)));
});

exports.criar = assincrono(async (req, res) => {
  if (await prisma.produto.findUnique({ where: { id: req.body.id } })) {
    throw erros.conflito("Já existe um produto com este identificador.");
  }
  await verificarRelacoes(req.body);
  const p = await prisma.produto.create({ data: Object.assign({ id: req.body.id }, produtoParaBd(req.body)) });
  res.status(201).json(produtoParaApi(p));
});

exports.atualizar = assincrono(async (req, res) => {
  await verificarRelacoes(req.body);
  const p = await prisma.produto.update({ where: { id: req.params.id }, data: produtoParaBd(req.body) });
  res.json(produtoParaApi(p));
});

exports.apagar = assincrono(async (req, res) => {
  // as encomendas antigas guardam o nome e o preço, por isso continuam completas
  await prisma.produto.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
