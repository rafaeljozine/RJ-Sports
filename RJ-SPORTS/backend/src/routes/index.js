/* ==========================================================
   Todas as rotas da API (montadas em /api)
   ========================================================== */

const router = require("express").Router();
const loja = require("../controllers/lojaController");

router.get("/saude", loja.saude);
// prova anti-robô para os formulários (ver middlewares/protecaoMiddleware.js)
router.get("/protecao", (req, res) => {
  res.set("Cache-Control", "no-store").json({ prova: require("../middlewares/protecaoMiddleware").emitirProva() });
});
router.get("/catalogo", loja.catalogo);
router.get("/catalogo.js", loja.catalogoScript);
// fotos de um Vercel Blob privado: /api/fotos/produtos/<nome>.jpg
router.get(/^\/fotos\/(.+)$/, require("../controllers/fotoController").servir);

router.use(require("./authRoutes"));
router.use(require("./produtoRoutes"));
router.use(require("./categoriaRoutes"));
router.use(require("./encomendaRoutes"));
router.use(require("./clienteRoutes"));
router.use(require("./fornecedorRoutes"));
router.use(require("./entregaRoutes"));
router.use(require("./campanhaRoutes"));
router.use(require("./financeiroRoutes"));
router.use(require("./adminRoutes"));

module.exports = router;
