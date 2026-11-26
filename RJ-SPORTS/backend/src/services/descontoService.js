/* ==========================================================
   Códigos de desconto (campanhas com código)
   Usado para pré-visualizar no checkout e, de novo, ao criar
   a encomenda — o valor final é sempre calculado aqui.
   ========================================================== */

const prisma = require("../config/database");
const { erros } = require("../utils/erros");
const { formatarPreco } = require("../utils/formatos");

/** Data de hoje em Moçambique (AAAA-MM-DD) */
function hojeMocambique() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Maputo" });
}

function normalizarCodigo(codigo) {
  return String(codigo || "").trim().toUpperCase();
}

/**
 * Valida o código para um subtotal (MT) e devolve o desconto.
 * Lança um erro 400 com a mensagem para o cliente se não servir.
 */
async function calcular(codigo, subtotal) {
  const cod = normalizarCodigo(codigo);
  const campanha = cod ? await prisma.campanha.findUnique({ where: { codigo: cod } }) : null;
  const hoje = hojeMocambique();

  // a mesma mensagem para "não existe", "desligado" e "fora de prazo"
  if (!campanha || !campanha.ativa ||
      (campanha.inicio && hoje < campanha.inicio) ||
      (campanha.fim && hoje > campanha.fim)) {
    throw erros.pedidoInvalido("Código de desconto inválido ou expirado.", { campo: "codigo" });
  }
  if (campanha.minimo && subtotal < campanha.minimo) {
    throw erros.pedidoInvalido("O código " + cod + " é válido para compras a partir de " + formatarPreco(campanha.minimo) + ".", { campo: "codigo" });
  }

  const bruto = campanha.tipo === "valor"
    ? campanha.valor
    : Math.round((subtotal * Math.min(campanha.valor, 90)) / 100);
  const desconto = Math.max(0, Math.min(bruto, subtotal));

  return {
    codigo: cod,
    nome: campanha.nome,
    tipo: campanha.tipo,
    valor: campanha.valor,
    minimo: campanha.minimo,
    desconto
  };
}

module.exports = { calcular, normalizarCodigo };
