/* ==========================================================
   Entregas: zonas (taxa e prazo por província)
   ========================================================== */

const crud = require("../utils/crud");
const { simples } = require("../utils/mapeadores");

module.exports = crud("zona", simples.zonas, { ordenar: { id: "asc" } });
