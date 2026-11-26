/* ==========================================================
   Middleware de validação: substitui req.body pelos dados
   validados ou responde 400 com a lista de erros.
   ========================================================== */

const { erros } = require("../utils/erros");

const validar = (esquema) => (req, res, next) => {
  const resultado = esquema.safeParse(req.body);
  if (!resultado.success) {
    const detalhes = resultado.error.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message }));
    return next(erros.pedidoInvalido(detalhes[0] ? detalhes[0].mensagem : "Dados inválidos.", detalhes));
  }
  req.body = resultado.data;
  next();
};

module.exports = validar;
