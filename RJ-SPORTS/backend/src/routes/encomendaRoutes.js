/* ==========================================================
   Encomendas
   Loja:   POST /api/encomendas            (checkout)
           GET  /api/encomendas/:numero?telefone=…  (acompanhar)
   Painel: GET /api/admin/encomendas · PUT/DELETE /api/admin/encomendas/:numero
   ========================================================== */

const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const c = require("../controllers/encomendaController");
const { exigirAdmin } = require("../middlewares/authMiddleware");
const validar = require("../validators/validar");
const v = require("../validators/esquemas");

const limite = (maximo, minutos) => rateLimit({
  windowMs: minutos * 60 * 1000,
  limit: maximo,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { erro: "Demasiados pedidos. Aguarde um pouco e tente novamente." }
});

router.post("/encomendas", limite(10, 15), validar(v.checkout), c.criar);
router.get("/encomendas/:numero", limite(30, 15), c.consultar);

router.get("/admin/encomendas", exigirAdmin, c.listar);
router.put("/admin/encomendas/:numero", exigirAdmin, validar(v.atualizarEncomenda), c.atualizar);
router.delete("/admin/encomendas/:numero", exigirAdmin, c.apagar);

module.exports = router;
