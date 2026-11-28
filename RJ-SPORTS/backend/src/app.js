/* ==========================================================
   Aplicação Express
   - /api/…        API da loja e do painel
   - /uploads/…    fotos enviadas no painel
   - /robots.txt · /sitemap.xml
   - /…            o site (pasta frontend) e o painel (/admin)
   ========================================================== */

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const rotas = require("./routes");
const seo = require("./controllers/seoController");
const { mesmoSite } = require("./middlewares/authMiddleware");
const { rotaNaoEncontrada, tratarErros } = require("./middlewares/errorMiddleware");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.proxies); // atrás do Caddy (1) ou do Vercel + Railway (2): IP real do cliente e HTTPS corretos

/* ---------- Segurança dos cabeçalhos ---------- */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // só scripts dos próprios ficheiros do site: nada embutido no HTML
      // (bloqueia a maior parte dos ataques XSS mesmo que algo escape)
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: env.producao ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  // HSTS só em produção (em localhost não faz sentido)
  strictTransportSecurity: env.producao ? { maxAge: 63072000, includeSubDomains: true } : false,
  frameguard: { action: "deny" }
}));
// funcionalidades do navegador que a loja nunca usa ficam desligadas
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  next();
});

/* ---------- Compressão e registo de pedidos ---------- */
app.use(compression());
if (env.producao) {
  // registo simples: método, endereço, estado e duração (sem dados pessoais)
  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api/") || res.statusCode >= 400) {
        console.log(new Date().toISOString(), req.method, req.path, res.statusCode, Date.now() - inicio + "ms");
      }
    });
    next();
  });
}

/* ---------- Pedidos ---------- */
app.use(cookieParser());
// a importação de cópias de segurança tem limite próprio (maior)
app.use((req, res, next) => (req.path === "/api/admin/importar" ? next() : express.json({ limit: "4mb" })(req, res, next)));
app.use("/api", mesmoSite);

/* ---------- API ---------- */
app.use("/api", rotas);
app.use("/api", rotaNaoEncontrada);

/* ---------- SEO ---------- */
app.get("/robots.txt", seo.robots);
app.get("/sitemap.xml", seo.sitemap);

/* ---------- Ficheiros ---------- */
app.use("/uploads", express.static(env.pastaUploads, { maxAge: "30d", immutable: true, fallthrough: false }));
app.use(express.static(env.pastaFrontend, {
  extensions: ["html"],
  setHeaders: (res, caminho) => {
    if (!env.producao) return res.setHeader("Cache-Control", "no-cache");
    if (/\.html$/.test(caminho)) res.setHeader("Cache-Control", "no-cache"); // páginas sempre atualizadas
    else if (/[\\/]assets[\\/]/.test(caminho)) res.setHeader("Cache-Control", "public, max-age=604800"); // imagens: 7 dias
    else res.setHeader("Cache-Control", "public, max-age=3600"); // CSS e JS: 1 hora
  }
}));

// página não encontrada → início da loja
app.use((req, res) => res.status(404).sendFile("index.html", { root: env.pastaFrontend }));

app.use(tratarErros);

module.exports = app;
