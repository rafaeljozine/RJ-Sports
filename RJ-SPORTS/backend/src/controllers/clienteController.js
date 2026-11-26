/* ==========================================================
   Clientes (criados a partir das encomendas)
   ========================================================== */

const { assincrono } = require("../utils/erros");
const servico = require("../services/encomendaService");

exports.listar = assincrono(async (req, res) => {
  res.json(await servico.clientes());
});
