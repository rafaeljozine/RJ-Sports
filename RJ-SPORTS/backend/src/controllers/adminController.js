/* ==========================================================
   Painel: dados completos, configurações da loja, fotos,
   cópia de segurança
   ========================================================== */

const { assincrono, erros } = require("../utils/erros");
const { enviarScript } = require("../utils/script");
const { lerSessao } = require("../middlewares/authMiddleware");
const adminService = require("../services/adminService");
const lojaService = require("../services/lojaService");
const env = require("../config/env");
const { nomeAleatorio } = require("../middlewares/uploadMiddleware");

/** /api/admin/dados.js — carregado pelas páginas do painel antes do resto */
exports.dadosScript = assincrono(async (req, res) => {
  const admin = await lerSessao(req);
  const dados = admin ? await adminService.fotografia(admin) : null;
  enviarScript(res, { RJSA_API: true, RJSA_DADOS: dados });
});

exports.dados = assincrono(async (req, res) => {
  res.json(await adminService.fotografia(req.admin));
});

exports.loja = assincrono(async (req, res) => {
  res.json(await lojaService.obterConfiguracaoLoja());
});

exports.guardarLoja = assincrono(async (req, res) => {
  res.json(await lojaService.guardarConfiguracaoLoja(req.body));
});

exports.upload = assincrono(async (req, res) => {
  if (!req.file) throw erros.pedidoInvalido("Nenhuma foto recebida.");

  // Vercel: a foto vai para o Vercel Blob.
  // - armazenamento privado: a loja mostra-a por /api/fotos/… (ver fotoController)
  // - armazenamento público: fica com o endereço https://… do próprio Blob
  if (env.blobAtivo) {
    const { put } = require("@vercel/blob");
    const foto = await put("produtos/" + nomeAleatorio(req.file.mimetype), req.file.buffer, {
      access: env.blobAcesso,
      contentType: req.file.mimetype,
      cacheControlMaxAge: 30 * 24 * 3600,
      token: env.blobToken
    });
    const url = env.blobAcesso === "private" ? "/api/fotos/" + foto.pathname : foto.url;
    return res.status(201).json({ url });
  }

  res.status(201).json({ url: "/uploads/" + req.file.filename });
});

exports.importar = assincrono(async (req, res) => {
  const copia = req.body;
  if (!copia || !Array.isArray(copia.produtos) || !Array.isArray(copia.encomendas)) {
    throw erros.pedidoInvalido("Este ficheiro não é uma cópia de segurança do painel.");
  }
  await adminService.importar(copia);
  res.json({ ok: true });
});
