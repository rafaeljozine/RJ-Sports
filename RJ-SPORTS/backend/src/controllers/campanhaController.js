/* ==========================================================
   Campanhas e códigos de desconto
   ========================================================== */

const crud = require("../utils/crud");
const { simples } = require("../utils/mapeadores");

module.exports = crud("campanha", simples.campanhas, { ordenar: { inicio: "desc" } });
