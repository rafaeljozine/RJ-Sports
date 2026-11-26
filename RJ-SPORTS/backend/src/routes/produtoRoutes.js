/* ==========================================================
   Produtos
   Loja:   GET /api/produtos · GET /api/produtos/:id
   Painel: /api/admin/produtos
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/produtoController");
const rotasCrud = require("./_crud");
const v = require("../validators/esquemas");

router.get("/produtos", c.listarPublico);
router.get("/produtos/:id", c.obterPublico);

rotasCrud(router, "/admin/produtos", c, v.produto);

module.exports = router;
