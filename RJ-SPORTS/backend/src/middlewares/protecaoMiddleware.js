/* ==========================================================
   Proteção contra robôs nos formulários
   1) GET /api/protecao entrega uma "prova" assinada pelo servidor
      (data + número aleatório + assinatura HMAC). A página pede-a
      quando abre o formulário.
   2) Ao enviar (login, encomenda, código de desconto, acompanhar)
      a prova segue no cabeçalho X-RJS-Prova. O servidor recusa se:
      - faltar ou a assinatura for falsa (pedido feito sem a página);
      - tiver mais de 2 horas (é pedida outra sozinha);
      - o envio for mais rápido do que uma pessoa consegue;
      - o campo-armadilha escondido (X-RJS-Armadilha) vier preenchido.
   Junta-se aos limites de tentativas por IP, por conta e por telefone.
   ========================================================== */

const crypto = require("crypto");
const env = require("../config/env");
const { ErroApp } = require("../utils/erros");

const VALIDADE_MS = 2 * 60 * 60 * 1000;
// chave própria, derivada do JWT_SECRET (não reutiliza a mesma chave)
const CHAVE = crypto.createHash("sha256").update("rjs-protecao:" + env.jwtSegredo).digest();

const assinar = (texto) => crypto.createHmac("sha256", CHAVE).update(texto).digest("base64url").slice(0, 32);

function emitirProva() {
  const corpo = Date.now().toString(36) + "." + crypto.randomBytes(9).toString("base64url");
  return corpo + "." + assinar(corpo);
}

const recusa = (mensagem, motivo) => new ErroApp(400, mensagem, { campo: "protecao", motivo });

/** Middleware: exige uma prova válida com pelo menos minSegundos de idade */
function exigirHumano(minSegundos) {
  return (req, res, next) => {
    if (req.get("x-rjs-armadilha")) {
      return next(recusa("Não foi possível confirmar o pedido.", "armadilha"));
    }
    const prova = String(req.get("x-rjs-prova") || "");
    const partes = prova.split(".");
    if (partes.length !== 3) {
      return next(recusa("Não foi possível confirmar o pedido. Recarregue a página e tente novamente.", "falta"));
    }
    const esperado = Buffer.from(assinar(partes[0] + "." + partes[1]));
    const recebido = Buffer.from(partes[2]);
    if (esperado.length !== recebido.length || !crypto.timingSafeEqual(esperado, recebido)) {
      return next(recusa("Não foi possível confirmar o pedido. Recarregue a página e tente novamente.", "falsa"));
    }
    const idade = Date.now() - parseInt(partes[0], 36);
    if (!(idade >= 0) || idade > VALIDADE_MS) {
      return next(recusa("A página esteve aberta muito tempo. Tente novamente.", "expirada"));
    }
    if (idade < minSegundos * 1000) {
      return next(recusa("Foi muito rápido. Aguarde um momento e tente novamente.", "rapida"));
    }
    next();
  };
}

module.exports = { emitirProva, exigirHumano };
