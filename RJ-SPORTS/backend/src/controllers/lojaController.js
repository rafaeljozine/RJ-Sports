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

exports.saude = (req, res) => res.json({ ok: true, hora: new Date().toISOString() });
