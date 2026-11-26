/* ==========================================================
   Campanhas — /api/admin/campanhas
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/campanhaController");
const rotasCrud = require("./_crud");
const v = require("../validators/esquemas");

rotasCrud(router, "/admin/campanhas", c, v.campanha);

module.exports = router;
