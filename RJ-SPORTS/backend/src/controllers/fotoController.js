/* ==========================================================
   GET /api/fotos/produtos/… — fotos guardadas num Vercel Blob
   privado. O servidor lê-as com a autenticação do Blob (OIDC ou chave)
   e devolve-as com cache longa: a rede do Vercel guarda cada
   foto e a função quase não volta a ser chamada.
   (Os nomes são aleatórios e nunca mudam, por isso "immutable".)
   ========================================================== */

const { Readable } = require("stream");
const env = require("../config/env");
const { assincrono, erros } = require("../utils/erros");

const CAMINHO = /^produtos\/[a-f0-9]{24}\.(jpg|png|webp)$/;

exports.servir = assincrono(async (req, res) => {
  const caminho = req.params[0] || "";
  if (!env.blobAtivo || !CAMINHO.test(caminho)) throw erros.naoEncontrado("Foto não encontrada.");

  const { get } = require("@vercel/blob");
  const r = await get(caminho, {
    access: env.blobAcesso,
    token: env.blobToken,
    ifNoneMatch: req.get("if-none-match") || undefined
  });
  if (!r) throw erros.naoEncontrado("Foto não encontrada.");

  res.set({
    "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
    ETag: r.blob.etag
  });
  if (r.statusCode === 304) return res.status(304).end();

  res.type(r.blob.contentType);
  if (r.blob.size != null) res.set("Content-Length", String(r.blob.size));
  Readable.fromWeb(r.stream).pipe(res);
});
