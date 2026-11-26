/* ==========================================================
   Fornecedores (dropshipping)
   ========================================================== */

const prisma = require("../config/database");
const crud = require("../utils/crud");
const { simples } = require("../utils/mapeadores");
const { erros } = require("../utils/erros");

module.exports = crud("fornecedor", simples.fornecedores, {
  ordenar: { nome: "asc" },
  antesApagar: async (id) => {
    const n = await prisma.produto.count({ where: { fornecedorId: id } });
    if (n) throw erros.conflito("Há " + n + " produto(s) deste fornecedor. Mude-os primeiro.");
  }
});
