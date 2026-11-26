/* ==========================================================
   Sessão do painel
   O login cria um cookie "rjs_sessao" (httpOnly, SameSite=Strict)
   com um JWT. O JavaScript da página não consegue lê-lo.
   ========================================================== */

const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const env = require("../config/env");
const { erros } = require("../utils/erros");

const COOKIE = "rjs_sessao";

function opcoesCookie() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: env.producao,
    path: "/",
    maxAge: env.sessaoHoras * 3600 * 1000
  };
}

function criarSessao(res, admin) {
  const token = jwt.sign({ sub: admin.id }, env.jwtSegredo, { expiresIn: env.sessaoHoras + "h" });
  res.cookie(COOKIE, token, opcoesCookie());
}

function terminarSessao(res) {
  res.clearCookie(COOKIE, Object.assign(opcoesCookie(), { maxAge: undefined }));
}

/** Devolve o administrador da sessão (ou null) sem dar erro */
async function lerSessao(req) {
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return null;
  try {
    const dados = jwt.verify(token, env.jwtSegredo);
    return await prisma.admin.findUnique({ where: { id: Number(dados.sub) } });
  } catch (e) {
    return null;
  }
}

/** Protege as rotas do painel */
async function exigirAdmin(req, res, next) {
  const admin = await lerSessao(req);
  if (!admin) return next(erros.naoAutenticado());
  req.admin = admin;
  next();
}

/** Endereços do próprio site (SITE_URL e ORIGENS_PERMITIDAS) */
const anfitrioesSite = new Set(
  [env.urlSite, ...env.origensExtra]
    .map((u) => { try { return new URL(u).host; } catch (e) { return null; } })
    .filter(Boolean)
);

/**
 * Proteção extra contra pedidos de outros sites (CSRF):
 * pedidos que alteram dados têm de vir do próprio site — o mesmo
 * servidor ou o endereço público da loja (ex.: site no Vercel que
 * reencaminha /api para este servidor).
 */
function mesmoSite(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origem = req.get("origin");
  if (origem) {
    let host;
    try {
      host = new URL(origem).host;
    } catch (e) {
      return next(erros.proibido("Pedido de origem não permitida."));
    }
    if (host !== req.get("host") && !anfitrioesSite.has(host)) {
      return next(erros.proibido("Pedido de origem não permitida."));
    }
  }
  next();
}

module.exports = { criarSessao, terminarSessao, lerSessao, exigirAdmin, mesmoSite };
