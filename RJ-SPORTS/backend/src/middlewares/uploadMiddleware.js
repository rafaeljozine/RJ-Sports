/* ==========================================================
   Envio de fotos de produtos
   Só imagens JPEG, PNG ou WebP, com nome de ficheiro aleatório.
   - Com o Vercel Blob (BLOB_STORE_ID ou BLOB_READ_WRITE_TOKEN): a foto fica em memória e
     o controller envia-a para o Vercel Blob.
   - Sem ele (desenvolvimento / Docker): vai para backend/uploads.
   ========================================================== */

const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const env = require("../config/env");
const { erros } = require("../utils/erros");

const TIPOS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const nomeAleatorio = (tipo) => crypto.randomBytes(12).toString("hex") + TIPOS[tipo];

let armazenamento;
if (env.blobAtivo) {
  armazenamento = multer.memoryStorage();
} else {
  try {
    fs.mkdirSync(env.pastaUploads, { recursive: true });
  } catch (erro) {
    // no Vercel o disco é só de leitura: sem Blob ligado, o envio de fotos falha com aviso
    console.warn("Pasta de fotos indisponível (" + erro.code + "). Ligue um Vercel Blob ao projeto.");
  }
  armazenamento = multer.diskStorage({
    destination: env.pastaUploads,
    filename: (req, ficheiro, cb) => cb(null, nomeAleatorio(ficheiro.mimetype))
  });
}

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024, files: 1 },
  fileFilter: (req, ficheiro, cb) => {
    if (TIPOS[ficheiro.mimetype]) cb(null, true);
    else cb(erros.pedidoInvalido("Envie uma imagem JPEG, PNG ou WebP."));
  }
});

module.exports = upload;
module.exports.nomeAleatorio = nomeAleatorio;
