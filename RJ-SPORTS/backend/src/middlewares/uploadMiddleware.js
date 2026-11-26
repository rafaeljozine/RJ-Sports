/* ==========================================================
   Envio de fotos de produtos (para a pasta backend/uploads)
   Só imagens JPEG, PNG ou WebP. Nome de ficheiro aleatório.
   ========================================================== */

const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const env = require("../config/env");
const { erros } = require("../utils/erros");

const TIPOS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

fs.mkdirSync(env.pastaUploads, { recursive: true });

const armazenamento = multer.diskStorage({
  destination: env.pastaUploads,
  filename: (req, ficheiro, cb) => cb(null, crypto.randomBytes(12).toString("hex") + TIPOS[ficheiro.mimetype])
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024, files: 1 },
  fileFilter: (req, ficheiro, cb) => {
    if (TIPOS[ficheiro.mimetype]) cb(null, true);
    else cb(erros.pedidoInvalido("Envie uma imagem JPEG, PNG ou WebP."));
  }
});

module.exports = upload;
