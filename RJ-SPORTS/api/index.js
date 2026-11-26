/* ==========================================================
   Função do Vercel: toda a API (/api/…), robots.txt e
   sitemap.xml passam por aqui (ver vercel.json).
   É a mesma aplicação Express usada em localhost e no Docker.
   ========================================================== */

module.exports = require("../backend/src/app");
