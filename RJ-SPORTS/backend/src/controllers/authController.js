/* ==========================================================
   Autenticação do painel
   ========================================================== */

const bcrypt = require("bcryptjs");
const prisma = require("../config/database");
const { assincrono, erros, ErroApp } = require("../utils/erros");
const { criarSessao, terminarSessao } = require("../middlewares/authMiddleware");
const LimiteStore = require("../utils/limiteStore");

// Além do limite por IP: no máximo 10 tentativas falhadas por conta a cada
// 15 minutos (trava ataques distribuídos por muitos IPs contra a mesma conta)
const FALHAS_MAX = 10;
const falhasConta = new LimiteStore("login-conta");
falhasConta.init({ windowMs: 15 * 60 * 1000 });

const publicoConta = (a) => ({ nome: a.nome, email: a.email, inicial: a.inicial });

// hash de referência para gastar o mesmo tempo quando o email não existe
// (não deixa perceber quais emails têm conta)
const HASH_FALSO = bcrypt.hashSync("rjs-sem-conta", 12);

exports.entrar = assincrono(async (req, res) => {
  const { email, palavraPasse } = req.body;
  const anteriores = await falhasConta.get(email);
  if (anteriores && anteriores.totalHits >= FALHAS_MAX) {
    throw new ErroApp(429, "Demasiadas tentativas falhadas nesta conta. Tente novamente daqui a 15 minutos.");
  }
  const admin = await prisma.admin.findUnique({ where: { email } });
  const certo = await bcrypt.compare(palavraPasse, admin ? admin.hash : HASH_FALSO);
  if (!admin || !certo) {
    await falhasConta.increment(email);
    throw erros.naoAutenticado("Email ou palavra-passe incorretos.");
  }
  await falhasConta.resetKey(email);
  criarSessao(res, admin);
  res.json(publicoConta(admin));
});

exports.sair = (req, res) => {
  terminarSessao(res);
  res.status(204).end();
};

exports.eu = (req, res) => res.json(publicoConta(req.admin));

exports.alterarConta = assincrono(async (req, res) => {
  const admin = await prisma.admin.update({
    where: { id: req.admin.id },
    data: { nome: req.body.nome, email: req.body.email }
  });
  res.json(publicoConta(admin));
});

exports.alterarPalavraPasse = assincrono(async (req, res) => {
  const certo = await bcrypt.compare(req.body.atual, req.admin.hash);
  if (!certo) throw erros.pedidoInvalido("A palavra-passe atual está incorreta.");
  // a data das sessões avança: as sessões abertas noutros dispositivos terminam
  // (arredondada ao segundo, como a hora de emissão do JWT)
  const agora = new Date(Math.floor(Date.now() / 1000) * 1000);
  const admin = await prisma.admin.update({
    where: { id: req.admin.id },
    data: { hash: await bcrypt.hash(req.body.nova, 12), inicial: false, sessoesDesde: agora }
  });
  criarSessao(res, admin);
  res.json(publicoConta(admin));
});
