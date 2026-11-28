/* ==========================================================
   Loja (público): catálogo e estado do servidor
   ========================================================== */

const { assincrono } = require("../utils/erros");
const { enviarScript } = require("../utils/script");
const lojaService = require("../services/lojaService");

/** /api/catalogo.js — carregado pelas páginas da loja antes do resto */
// O catálogo é público e igual para todos: a rede do Vercel guarda-o
// 1 minuto e, depois disso, entrega a cópia guardada enquanto busca a
// nova em segundo plano. Uma alteração no painel aparece na loja em ~1 min.
// (Os preços das encomendas são sempre recalculados no servidor.)
const CACHE_CATALOGO = "public, max-age=0, s-maxage=60, stale-while-revalidate=86400";

exports.catalogoScript = assincrono(async (req, res) => {
  enviarScript(res, { RJS_DADOS: await lojaService.catalogoPublico() }, CACHE_CATALOGO);
});

exports.catalogo = assincrono(async (req, res) => {
  res.set("Cache-Control", CACHE_CATALOGO);
  res.json(await lojaService.catalogoPublico());
});

// "ip" é o endereço de quem pergunta, tal como o servidor o vê:
// serve para confirmar o TRUST_PROXY (tem de ser o IP do visitante)
exports.saude = (req, res) => res.json({ ok: true, hora: new Date().toISOString(), ip: req.ip });
