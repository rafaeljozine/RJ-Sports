/* ==========================================================
   Erros da aplicação e ajuda para rotas assíncronas
   ========================================================== */

/** Erro com código HTTP e mensagem para mostrar ao utilizador */
class ErroApp extends Error {
  constructor(estado, mensagem, detalhes) {
    super(mensagem);
    this.estado = estado;
    this.detalhes = detalhes;
  }
}

const erros = {
  pedidoInvalido: (mensagem, detalhes) => new ErroApp(400, mensagem || "Pedido inválido.", detalhes),
  naoAutenticado: (mensagem) => new ErroApp(401, mensagem || "Sessão expirada. Entre novamente."),
  proibido: (mensagem) => new ErroApp(403, mensagem || "Sem permissão."),
  naoEncontrado: (mensagem) => new ErroApp(404, mensagem || "Não encontrado."),
  conflito: (mensagem) => new ErroApp(409, mensagem || "Já existe um registo igual.")
};

/** Envolve um controller assíncrono para os erros irem para o errorMiddleware */
const assincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ErroApp, erros, assincrono };
