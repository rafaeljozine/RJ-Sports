/* ==========================================================
   Dados públicos da loja: catálogo e contactos
   ========================================================== */

const prisma = require("../config/database");
const { produtoParaApi, simples } = require("../utils/mapeadores");

async function obterConfiguracaoLoja() {
  const linha = await prisma.configuracao.findUnique({ where: { chave: "loja" } });
  try {
    return linha ? JSON.parse(linha.valor) : {};
  } catch (e) {
    return {};
  }
}

async function guardarConfiguracaoLoja(dados) {
  const valor = JSON.stringify(dados);
  await prisma.configuracao.upsert({ where: { chave: "loja" }, update: { valor }, create: { chave: "loja", valor } });
  return dados;
}

/** Catálogo que o site usa (só produtos visíveis, sem custos nem fornecedores) */
async function catalogoPublico() {
  const [produtos, categorias, loja] = await Promise.all([
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { criadoEm: "asc" } }),
    prisma.categoria.findMany({ orderBy: [{ ordem: "asc" }, { nome: "asc" }] }),
    obterConfiguracaoLoja()
  ]);
  return {
    produtos: produtos.map((p) => produtoParaApi(p, { publico: true })),
    categorias: categorias.map(simples.categorias.paraApi),
    loja
  };
}

module.exports = { catalogoPublico, obterConfiguracaoLoja, guardarConfiguracaoLoja };
