/* ==========================================================
   Loja (público): catálogo e estado do servidor
   ========================================================== */

const { assincrono } = require("../utils/erros");
const { enviarScript } = require("../utils/script");
const lojaService = require("../services/lojaService");

/** /api/catalogo.js — carregado pelas páginas da loja antes do resto */
exports.catalogoScript = assincrono(async (req, res) => {
  enviarScript(res, { RJS_DADOS: await lojaService.catalogoPublico() });
});

exports.catalogo = assincrono(async (req, res) => {
  res.json(await lojaService.catalogoPublico());
});

// "ip" é o endereço de quem pergunta, tal como o servidor o vê:
// serve para confirmar o TRUST_PROXY (tem de ser o IP do visitante)
exports.saude = (req, res) => res.json({ ok: true, hora: new Date().toISOString(), ip: req.ip });
