/* ==========================================================
   Clientes — GET /api/admin/clientes
   ========================================================== */

const router = require("express").Router();
const c = require("../controllers/clienteController");
const { exigirAdmin } = require("../middlewares/authMiddleware");

router.get("/admin/clientes", exigirAdmin, c.listar);

module.exports = router;
