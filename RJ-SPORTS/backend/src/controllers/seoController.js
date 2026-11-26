/* ==========================================================
   SEO: robots.txt e sitemap.xml (gerado a partir dos produtos)
   ========================================================== */

const prisma = require("../config/database");
const env = require("../config/env");
const { assincrono } = require("../utils/erros");

function base(req) {
  return env.urlSite || req.protocol + "://" + req.get("host");
}

const escaparXml = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

exports.robots = (req, res) => {
  res.type("text/plain").send(
    "User-agent: *\n" +
    "Disallow: /admin/\n" +
    "Disallow: /api/\n" +
    "Disallow: /carrinho.html\n" +
    "Disallow: /checkout.html\n" +
    "\nSitemap: " + base(req) + "/sitemap.xml\n"
  );
};

exports.sitemap = assincrono(async (req, res) => {
  const raiz = base(req);
  const [produtos, categorias] = await Promise.all([
    prisma.produto.findMany({ where: { ativo: true }, select: { id: true, atualizadoEm: true } }),
    prisma.categoria.findMany({ select: { id: true } })
  ]);

  const paginas = ["/", "/loja.html", "/categoria.html", "/sobre.html", "/contactos.html", "/acompanhar.html"]
    .map((p) => ({ loc: raiz + p }))
    .concat(categorias.map((c) => ({ loc: raiz + "/loja.html?c=" + encodeURIComponent(c.id) })))
    .concat(produtos.map((p) => ({
      loc: raiz + "/produto.html?id=" + encodeURIComponent(p.id),
      lastmod: p.atualizadoEm.toISOString().slice(0, 10)
    })));

  res.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paginas.map((p) => "  <url><loc>" + escaparXml(p.loc) + "</loc>" + (p.lastmod ? "<lastmod>" + p.lastmod + "</lastmod>" : "") + "</url>").join("\n") +
    "\n</urlset>\n"
  );
});
