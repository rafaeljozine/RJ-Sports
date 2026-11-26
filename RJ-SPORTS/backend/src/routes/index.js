/* ==========================================================
   Todas as rotas da API (montadas em /api)
   ========================================================== */

const router = require("express").Router();
const loja = require("../controllers/lojaController");

router.get("/saude", loja.saude);
router.get("/catalogo", loja.catalogo);
router.get("/catalogo.js", loja.catalogoScript);

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
