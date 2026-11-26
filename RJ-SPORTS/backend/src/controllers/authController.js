/* ==========================================================
   Autenticação do painel
   ========================================================== */

const bcrypt = require("bcryptjs");
const prisma = require("../config/database");
const { assincrono, erros } = require("../utils/erros");
const { criarSessao, terminarSessao } = require("../middlewares/authMiddleware");

const publicoConta = (a) => ({ nome: a.nome, email: a.email, inicial: a.inicial });

// hash de referência para gastar o mesmo tempo quando o email não existe
// (não deixa perceber quais emails têm conta)
const HASH_FALSO = bcrypt.hashSync("rjs-sem-conta", 12);

exports.entrar = assincrono(async (req, res) => {
  const { email, palavraPasse } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });
  const certo = await bcrypt.compare(palavraPasse, admin ? admin.hash : HASH_FALSO);
  if (!admin || !certo) throw erros.naoAutenticado("Email ou palavra-passe incorretos.");
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
  const admin = await prisma.admin.update({
    where: { id: req.admin.id },
    data: { hash: await bcrypt.hash(req.body.nova, 12), inicial: false }
  });
  criarSessao(res, admin);
  res.json(publicoConta(admin));
});
