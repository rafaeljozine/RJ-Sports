/* ==========================================================
   Envia dados como um pequeno ficheiro JavaScript.
   O site carrega-o com <script src="/api/....js"> ANTES do resto,
   para ter os dados logo disponíveis (sem esperar por pedidos).
   Se o site for aberto sem o servidor, o ficheiro simplesmente
   não existe e o site usa os dados locais.
   ========================================================== */

const SEPARADOR_LINHA = String.fromCharCode(0x2028);
const SEPARADOR_PARAGRAFO = String.fromCharCode(0x2029);

function paraJs(valor) {
  return JSON.stringify(valor)
    .split("<").join("\\u003c")
    .split(SEPARADOR_LINHA).join("\\u2028")
    .split(SEPARADOR_PARAGRAFO).join("\\u2029");
}

/** cache: valor de Cache-Control (por omissão "no-store", ex.: dados do painel) */
function enviarScript(res, atribuicoes, cache = "no-store") {
  const corpo = Object.keys(atribuicoes)
    .map((nome) => "window." + nome + "=" + paraJs(atribuicoes[nome]) + ";")
    .join("\n");
  res.set({
    "Content-Type": "application/javascript; charset=utf-8",
    "Cache-Control": cache
  });
  res.send(corpo);
}

module.exports = { enviarScript };
