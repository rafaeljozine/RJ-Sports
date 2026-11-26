/* ==========================================================
   Entregas (zonas)
   Loja:   GET /api/zonas  (províncias, taxas e prazos)
   Painel: /api/admin/zonas
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/entregaController");
const rotasCrud = require("./_crud");
const v = require("../validators/esquemas");

router.get("/zonas", c.listar);
rotasCrud(router, "/admin/zonas", c, v.zona);

module.exports = router;
