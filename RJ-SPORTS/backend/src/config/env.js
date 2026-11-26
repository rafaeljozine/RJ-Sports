/* ==========================================================
   Variáveis de ambiente (lidas do ficheiro .env)
   ========================================================== */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const producao = process.env.NODE_ENV === "production";
const pastaBackend = path.join(__dirname, "..", "..");

const env = {
  producao,
  porta: Number(process.env.PORT) || 3000,
  // endereço público da loja (ex.: https://www.rjsports.co.mz) — usado no sitemap
  // no Vercel, sem SITE_URL, usa o domínio de produção do projeto
  urlSite: (process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "")
  ).replace(/\/+$/, ""),
  vercel: !!process.env.VERCEL,
  // fotos no Vercel Blob (vazio = pasta uploads)
  blobToken: process.env.BLOB_READ_WRITE_TOKEN || "",
  // tipo do armazenamento Blob: "private" (fotos servidas por /api/fotos) ou "public"
  blobAcesso: process.env.BLOB_ACESSO === "public" ? "public" : "private",
  // outros endereços do site que podem enviar pedidos à API
  // (ex.: o endereço .vercel.app depois de ligar um domínio próprio)
  origensExtra: (process.env.ORIGENS_PERMITIDAS || "").split(",").map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean),
  // quantos proxies há à frente do servidor (Vercel = 1; Caddy = 1)
  proxies: process.env.TRUST_PROXY != null && process.env.TRUST_PROXY !== "" ? Number(process.env.TRUST_PROXY) : 1,
  jwtSegredo: process.env.JWT_SECRET || "",
  sessaoHoras: Number(process.env.SESSAO_HORAS) || 8,
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB) || 3,
  pastaFrontend: process.env.FRONTEND_DIR
    ? path.resolve(process.env.FRONTEND_DIR)
    : path.join(pastaBackend, "..", "frontend"),
  pastaUploads: process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(pastaBackend, "uploads")
};

/* ---------- Verificações ---------- */
const problemas = [];

// Sem segredo forte as sessões do painel não são seguras
if (!env.jwtSegredo || env.jwtSegredo.length < 32 || /mude-isto/.test(env.jwtSegredo)) {
  problemas.push("JWT_SECRET em falta ou fraco (use pelo menos 32 caracteres aleatórios).");
}
if (producao && !/^https:\/\//.test(env.urlSite)) {
  problemas.push("SITE_URL tem de ser o endereço público com https:// (ex.: https://www.rjsports.co.mz).");
}

if (problemas.length) {
  const mensagem = "Configuração inválida no .env:\n  - " + problemas.join("\n  - ");
  if (producao) throw new Error(mensagem);
  console.warn("⚠ " + mensagem);
}

module.exports = env;
