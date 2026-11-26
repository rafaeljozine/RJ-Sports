/* ==========================================================
   Financeiro: despesas e resumo mensal
   ========================================================== */

const crud = require("../utils/crud");
const { simples } = require("../utils/mapeadores");
const { assincrono, erros } = require("../utils/erros");
const { resumoMes } = require("../services/financeiroService");

exports.despesas = crud("despesa", simples.despesas, { ordenar: { data: "desc" } });

exports.resumo = assincrono(async (req, res) => {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(mes)) throw erros.pedidoInvalido("Mês inválido (use AAAA-MM).");
  res.json(await resumoMes(mes));
});
