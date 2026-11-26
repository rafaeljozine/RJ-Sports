/* ==========================================================
   Encomendas
   ========================================================== */

const { assincrono } = require("../utils/erros");
const servico = require("../services/encomendaService");

/* ---------- Loja (público) ---------- */
exports.criar = assincrono(async (req, res) => {
  const encomenda = await servico.criarDoCheckout(req.body);
  res.status(201).json(encomenda);
});

exports.consultar = assincrono(async (req, res) => {
  const encomenda = await servico.consultarPublica(req.params.numero, req.query.telefone);
  res.json(encomenda);
});

/* ---------- Painel ---------- */
exports.listar = assincrono(async (req, res) => {
  res.json(await servico.listar());
});

exports.atualizar = assincrono(async (req, res) => {
  res.json(await servico.atualizar(req.params.numero, req.body));
});

exports.apagar = assincrono(async (req, res) => {
  await servico.apagar(req.params.numero);
  res.status(204).end();
});
