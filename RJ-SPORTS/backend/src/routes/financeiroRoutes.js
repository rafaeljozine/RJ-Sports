/* ==========================================================
   Financeiro
   /api/admin/despesas · GET /api/admin/financeiro/resumo?mes=AAAA-MM
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/financeiroController");
const { exigirAdmin } = require("../middlewares/authMiddleware");
const rotasCrud = require("./_crud");
const v = require("../validators/esquemas");

rotasCrud(router, "/admin/despesas", c.despesas, v.despesa);
router.get("/admin/financeiro/resumo", exigirAdmin, c.resumo);

module.exports = router;
