/* ==========================================================
   Categorias
   Loja:   GET /api/categorias
   Painel: /api/admin/categorias
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/categoriaController");
const rotasCrud = require("./_crud");
const v = require("../validators/esquemas");

router.get("/categorias", c.listar);
rotasCrud(router, "/admin/categorias", c, v.categoria);

module.exports = router;
