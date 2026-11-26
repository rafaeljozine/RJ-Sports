/* ==========================================================
   Painel: dados, configuração da loja, fotos, cópia de segurança
   ========================================================== */

const express = require("express");
const router = express.Router();
const c = require("../controllers/adminController");
const { exigirAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const validar = require("../validators/validar");
const v = require("../validators/esquemas");

router.get("/admin/dados.js", c.dadosScript);
router.get("/admin/dados", exigirAdmin, c.dados);
router.get("/admin/loja", exigirAdmin, c.loja);
router.put("/admin/loja", exigirAdmin, validar(v.loja), c.guardarLoja);
router.post("/admin/uploads", exigirAdmin, upload.single("foto"), c.upload);
router.post("/admin/importar", exigirAdmin, express.json({ limit: "60mb" }), c.importar);

module.exports = router;
