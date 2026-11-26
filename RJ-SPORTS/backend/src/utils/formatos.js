/* ==========================================================
   Formatos: telefone de Moçambique, número de encomenda, JSON
   ========================================================== */

const crypto = require("crypto");

/** Devolve os 9 algarismos (ex.: 841234567) ou "" se o número for inválido */
function normalizarTelefone(valor) {
  let d = String(valor || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("258")) d = d.slice(3);
  return /^8[2-7]\d{7}$/.test(d) ? d : "";
}

/** 841234567 -> "+258 84 123 4567" */
function formatarTelefone(nove) {
  return "+258 " + nove.slice(0, 2) + " " + nove.slice(2, 5) + " " + nove.slice(5);
}

/** Número de encomenda no formato RJS-123456 */
function gerarNumero() {
  return "RJS-" + String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

/** Lê uma lista guardada como texto JSON */
function lista(texto) {
  try {
    const v = JSON.parse(texto || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

/** 1850 → "1.850,00 MT" (o mesmo formato da loja) */
function formatarPreco(valor) {
  const [inteiro, decimal] = Number(valor || 0).toFixed(2).split(".");
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimal + " MT";
}

module.exports = { normalizarTelefone, formatarTelefone, gerarNumero, lista, formatarPreco };
