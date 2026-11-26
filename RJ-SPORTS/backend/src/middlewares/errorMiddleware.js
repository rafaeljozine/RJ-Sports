/* ==========================================================
   Respostas de erro em JSON: { erro: "mensagem", detalhes? }
   ========================================================== */

const { Prisma } = require("@prisma/client");
const env = require("../config/env");

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: "Endereço da API não encontrado." });
}

// eslint-disable-next-line no-unused-vars
function tratarErros(erro, req, res, next) {
  // Erros conhecidos da aplicação
  if (erro.estado) {
    return res.status(erro.estado).json({ erro: erro.message, detalhes: erro.detalhes });
  }

  // JSON mal formado ou pedido demasiado grande
  if (erro.type === "entity.parse.failed") return res.status(400).json({ erro: "JSON inválido." });
  if (erro.type === "entity.too.large") return res.status(413).json({ erro: "Pedido demasiado grande." });

  // Upload (multer)
  if (erro.name === "MulterError") {
    const mensagem = erro.code === "LIMIT_FILE_SIZE" ? "A foto é demasiado grande." : "Erro no envio do ficheiro.";
    return res.status(400).json({ erro: mensagem });
  }

  // Base de dados
  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === "P2002") return res.status(409).json({ erro: "Já existe um registo com esses dados." });
    if (erro.code === "P2025") return res.status(404).json({ erro: "Registo não encontrado." });
    if (erro.code === "P2003") return res.status(409).json({ erro: "Este registo está a ser usado noutro lado." });
  }

  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor.", ...(env.producao ? {} : { tecnico: erro.message }) });
}

module.exports = { rotaNaoEncontrada, tratarErros };
