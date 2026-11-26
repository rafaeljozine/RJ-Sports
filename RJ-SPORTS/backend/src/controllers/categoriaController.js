/* ==========================================================
   Categorias
   ========================================================== */

const prisma = require("../config/database");
const crud = require("../utils/crud");
const { simples } = require("../utils/mapeadores");
const { erros } = require("../utils/erros");

module.exports = crud("categoria", simples.categorias, {
  ordenar: [{ ordem: "asc" }, { nome: "asc" }],
  // categorias novas ficam no fim da lista
  aoCriar: async () => {
    const ultima = await prisma.categoria.aggregate({ _max: { ordem: true } });
    return { ordem: (ultima._max.ordem ?? -1) + 1 };
  },
  antesApagar: async (id) => {
    const n = await prisma.produto.count({ where: { categoriaId: id } });
    if (n) throw erros.conflito("Há " + n + " produto(s) nesta categoria. Mude-os de categoria primeiro.");
  }
});
