/* ==========================================================
   RJ SPORTS — Admin: entregas
   - Encomendas a preparar / a caminho
   - Zonas de entrega (taxa e prazo por província)
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "entregas", titulo: "Entregas" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();

  conteudo.innerHTML =
    '<section class="cartao" style="margin-bottom:28px"><div class="cartao__topo"><h2>Encomendas em curso</h2>' +
    '<span class="campo__ajuda">Confirmadas (a preparar) e enviadas (a caminho)</span></div>' +
    '<div class="tabela-caixa"><table class="tabela"><thead><tr><th>Nº</th><th>Cliente</th><th>Destino</th><th class="num">A cobrar</th><th>Estado</th><th class="acoes"></th></tr></thead>' +
    '<tbody id="em-curso"></tbody></table></div></section>' +
    '<h2 style="font-family:var(--fonte-corpo);font-size:1.0625rem;text-transform:none;letter-spacing:0;margin:0 0 12px">Zonas e taxas de entrega</h2>' +
    '<div id="zonas"></div>';

  function zonaDe(provincia) {
    return db.zonas.filter(function (z) { return z.provincia === provincia; })[0];
  }

  function desenharEmCurso() {
    var lista = db.encomendas.filter(function (x) { return x.estado === "Confirmada" || x.estado === "Enviada"; })
      .sort(function (a, b) { return a.data.localeCompare(b.data); });
    document.getElementById("em-curso").innerHTML = lista.length
      ? lista.map(function (x) {
          var c = x.cliente;
          var taxa = x.taxaEntrega != null ? Number(x.taxaEntrega) : null;
          var proximo = x.estado === "Confirmada" ? "Enviada" : "Entregue";
          return "<tr>" +
            '<td><a class="ligacao" href="detalhes-encomenda.html?n=' + encodeURIComponent(x.numero) + '">' + e(x.numero) + "</a><br><small>" + RJSA.data(x.data) + "</small></td>" +
            "<td><strong>" + e(c.nome) + "</strong><br><small>" + e(c.telefone) + "</small></td>" +
            "<td>" + e(c.bairro) + ", " + e(c.cidade) + "<br><small>" + e(c.provincia) + "</small></td>" +
            '<td class="num"><strong>' + RJSA.preco(x.total + (taxa || 0)) + "</strong>" + (taxa == null ? '<br><small style="color:var(--estado-enviada)">taxa por definir</small>' : "") + "</td>" +
            "<td>" + RJSA.estado(x.estado) + (x.estado === "Confirmada" && !x.pedidoFornecedor ? '<br><small style="color:var(--estado-enviada)">pedido ao fornecedor por fazer</small>' : "") + "</td>" +
            '<td class="acoes"><button class="btn-adm" data-avancar="' + e(x.numero) + '" data-para="' + proximo + '">Marcar como ' + proximo.toLowerCase() + "</button></td>" +
            "</tr>";
        }).join("")
      : '<tr><td colspan="6" class="vazio-tabela">Não há encomendas em curso.</td></tr>';
  }

  conteudo.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-avancar]");
    if (!b) return;
    var enc = db.encomendas.filter(function (x) { return x.numero === b.getAttribute("data-avancar"); })[0];
    var para = b.getAttribute("data-para");
    enc.estado = para;
    enc.historico = enc.historico || [];
    enc.historico.push({ estado: para, data: new Date().toISOString(), nota: "" });
    if (para === "Enviada") enc.pedidoFornecedor = true;
    RJSA.db.guardar();
    RJSA.sincronizarEstadoLoja(enc);
    RJSA.aviso(enc.numero + " marcada como " + para.toLowerCase() + ".");
    desenharEmCurso();
  });

  desenharEmCurso();

  RJSA.crud({
    alvo: document.getElementById("zonas"),
    colecao: "zonas",
    prefixo: "zona",
    novoRotulo: "Nova zona",
    tituloNovo: "Nova zona de entrega",
    tituloEditar: "Editar zona de entrega",
    pesquisar: function (z) { return z.provincia; },
    nome: function (z) { return z.provincia; },
    ordenar: function (a, b) { return RJSA.PROVINCIAS.indexOf(a.provincia) - RJSA.PROVINCIAS.indexOf(b.provincia); },
    antes: function () {
      var porDefinir = db.zonas.filter(function (z) { return z.taxa == null; }).length;
      return porDefinir
        ? '<div class="alerta">' + ic.aviso + "<div><strong>Defina as taxas de entrega</strong>Há " + porDefinir +
          " zona(s) sem taxa. Ao definir, a taxa passa a aparecer como sugestão nas encomendas dessa província.</div></div>"
        : "";
    },
    campos: [
      { id: "provincia", rotulo: "Província", tipo: "select", opcoes: RJSA.PROVINCIAS, obrigatorio: true, inteiro: true },
      { id: "taxa", rotulo: "Taxa de entrega", tipo: "number", min: 0, passo: 10, sufixo: "MT" },
      { id: "prazo", rotulo: "Prazo de entrega", placeholder: "Ex.: 1–2 dias úteis" },
      { id: "ativa", rotulo: "Entregamos nesta zona", tipo: "interruptor", padrao: true, inteiro: true }
    ],
    antesGuardar: function (r, item) {
      var repetida = db.zonas.some(function (z) { return z !== item && z.provincia === r.provincia; });
      if (repetida) {
        RJSA.aviso("Essa província já tem uma zona.", "erro");
        return false;
      }
    },
    aoMudar: function () {
      // sugere a taxa nas encomendas por confirmar que ainda não a têm
      db.encomendas.forEach(function (enc) {
        var z = zonaDe(enc.cliente.provincia);
        if (enc.taxaEntrega == null && z && z.taxa != null && enc.estado === "Recebida") enc.taxaEntrega = z.taxa;
      });
      RJSA.db.guardar();
      desenharEmCurso();
    },
    colunas: [
      { rotulo: "Província", valor: function (z) { return "<strong>" + e(z.provincia) + "</strong>"; } },
      { rotulo: "Taxa", classe: "num", valor: function (z) {
          return z.taxa == null ? '<span style="color:var(--estado-enviada)">Por definir</span>' : RJSA.preco(z.taxa);
        } },
      { rotulo: "Prazo", valor: function (z) { return e(z.prazo || "—"); } },
      { rotulo: "Encomendas", classe: "num", valor: function (z) {
          return db.encomendas.filter(function (x) { return x.cliente.provincia === z.provincia; }).length;
        } },
      { rotulo: "Estado", valor: function (z) {
          return z.ativa === false ? '<span class="estado estado--inativo">Sem entregas</span>' : '<span class="estado estado--ativo">Ativa</span>';
        } }
    ]
  });
})();
