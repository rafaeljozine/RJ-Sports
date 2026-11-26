/* ==========================================================
   Fornecedores — /api/admin/fornecedores
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/fornecedorController");
const rotasCrud = require("./_crud");
const v = require("../validators/esquemas");

rotasCrud(router, "/admin/fornecedores", c, v.fornecedor);

module.exports = router;
