/* ==========================================================
   /api/auth — login do painel
   ========================================================== */

const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const c = require("../controllers/authController");
const { exigirAdmin } = require("../middlewares/authMiddleware");
const validar = require("../validators/validar");
const v = require("../validators/esquemas");

// no máximo 10 tentativas de login a cada 15 minutos por IP
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { erro: "Demasiadas tentativas. Tente novamente daqui a 15 minutos." }
});

router.post("/auth/entrar", limiteLogin, validar(v.login), c.entrar);
router.post("/auth/sair", c.sair);
router.get("/auth/eu", exigirAdmin, c.eu);
router.put("/auth/conta", exigirAdmin, validar(v.conta), c.alterarConta);
router.put("/auth/palavra-passe", exigirAdmin, limiteLogin, validar(v.palavraPasse), c.alterarPalavraPasse);

module.exports = router;
