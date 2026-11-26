/* ==========================================================
   Encomendas
   Loja:   POST /api/encomendas            (checkout)
           POST /api/descontos/validar     (código de desconto)
           GET  /api/encomendas/:numero?telefone=…  (acompanhar)
   Painel: GET /api/admin/encomendas · PUT/DELETE /api/admin/encomendas/:numero
   ========================================================== */

const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const c = require("../controllers/encomendaController");
const { exigirAdmin } = require("../middlewares/authMiddleware");
const validar = require("../validators/validar");
const v = require("../validators/esquemas");
const LimiteStore = require("../utils/limiteStore");

// contadores guardados na base de dados (ver utils/limiteStore.js)
const limite = (nome, maximo, minutos) => rateLimit({
  windowMs: minutos * 60 * 1000,
  limit: maximo,
  store: new LimiteStore(nome),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { erro: "Demasiados pedidos. Aguarde um pouco e tente novamente." }
});

router.post("/encomendas", limite("encomenda", 10, 15), validar(v.checkout), c.criar);
router.post("/descontos/validar", limite("desconto", 20, 15), validar(v.validarDesconto), c.validarDesconto);
router.get("/encomendas/:numero", limite("acompanhar", 30, 15), c.consultar);

router.get("/admin/encomendas", exigirAdmin, c.listar);
router.put("/admin/encomendas/:numero", exigirAdmin, validar(v.atualizarEncomenda), c.atualizar);
router.delete("/admin/encomendas/:numero", exigirAdmin, c.apagar);

module.exports = router;
