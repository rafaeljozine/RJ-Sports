/* ==========================================================
   RJ SPORTS — Admin: painel inicial (resumo da loja)
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({
    pagina: "dashboard",
    titulo: "Painel",
    acoes: '<a class="btn-adm" href="adicionar-produto.html">' + RJSA.icones.mais + " Produto</a>"
  });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();

  /* ---------- Cálculos ---------- */
  var agora = new Date();
  var mesAtual = agora.toISOString().slice(0, 7);
  var anterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 15).toISOString().slice(0, 7);

  var validas = db.encomendas.filter(function (x) { return x.estado !== "Cancelada"; });
  var doMes = function (mes) { return validas.filter(function (x) { return x.data.slice(0, 7) === mes; }); };
  var soma = function (lista, f) { return lista.reduce(function (s, x) { return s + (f(x) || 0); }, 0); };

  var encMes = doMes(mesAtual);
  var encAnterior = doMes(anterior);
  var vendasMes = soma(encMes, function (x) { return x.total; });
  var vendasAnterior = soma(encAnterior, function (x) { return x.total; });
  var custoMes = soma(encMes, RJSA.custoEncomenda);
  var despesasMes = soma(db.despesas.filter(function (d) { return (d.data || "").slice(0, 7) === mesAtual; }), function (d) { return d.valor; });
  var lucroMes = vendasMes - custoMes - despesasMes;
  var porConfirmar = db.encomendas.filter(function (x) { return x.estado === "Recebida"; });
  var ticket = encMes.length ? vendasMes / encMes.length : 0;

  function variacao(atual, antes) {
    if (!antes) return '<div class="kpi__nota">Sem dados do mês anterior</div>';
    var pct = Math.round(((atual - antes) / antes) * 100);
    return '<div class="kpi__nota ' + (pct >= 0 ? "kpi__nota--positivo" : "kpi__nota--negativo") + '">' +
      (pct >= 0 ? "▲ " : "▼ ") + Math.abs(pct) + "% face ao mês anterior</div>";
  }

  /* ---------- Gráfico: vendas dos últimos 14 dias ---------- */
  var dias = [];
  for (var i = 13; i >= 0; i--) {
    var d = new Date(agora);
    d.setDate(d.getDate() - i);
    var chave = d.toISOString().slice(0, 10);
    dias.push({
      chave: chave,
      rotulo: d.toLocaleDateString("pt-PT", { day: "2-digit" }),
      total: soma(validas.filter(function (x) { return x.data.slice(0, 10) === chave; }), function (x) { return x.total; })
    });
  }
  var maximo = Math.max.apply(null, dias.map(function (x) { return x.total; })) || 1;
  var grafico =
    '<div class="grafico" role="img" aria-label="Vendas dos últimos 14 dias">' +
    dias.map(function (x) {
      var altura = x.total ? Math.max(4, (x.total / maximo) * 100) : 2;
      return '<div class="grafico__coluna"><span class="grafico__dica">' + e(new Date(x.chave).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })) + ": " + RJSA.preco(x.total) + "</span>" +
        '<div class="grafico__barra' + (x.total ? "" : " grafico__barra--vazia") + '" style="height:' + altura + '%"></div></div>';
    }).join("") +
    '</div><div class="grafico__eixo">' + dias.map(function (x) { return "<span>" + x.rotulo + "</span>"; }).join("") + "</div>";

  /* ---------- Encomendas por estado ---------- */
  var porEstado = RJSA.ESTADOS.map(function (s) {
    return { estado: s, n: db.encomendas.filter(function (x) { return x.estado === s; }).length };
  });
  var maxEstado = Math.max.apply(null, porEstado.map(function (x) { return x.n; })) || 1;
  var cores = { Recebida: "var(--estado-recebida)", Confirmada: "var(--estado-confirmada)", Enviada: "var(--estado-enviada)", Entregue: "var(--estado-entregue)", Cancelada: "var(--estado-cancelada)" };
  var estados =
    '<div class="barras-h">' + porEstado.map(function (x) {
      return '<a href="encomendas.html?estado=' + encodeURIComponent(x.estado) + '"><div class="barra-h__topo"><span>' + x.estado + "</span><strong>" + x.n + "</strong></div>" +
        '<div class="barra-h__trilho"><div class="barra-h__enchimento" style="width:' + (x.n / maxEstado) * 100 + "%;background:" + cores[x.estado] + '"></div></div></a>';
    }).join("") + "</div>";

  /* ---------- Últimas encomendas ---------- */
  var ultimas = db.encomendas.slice(0, 6).map(function (x) {
    return "<tr>" +
      '<td><a class="ligacao" href="detalhes-encomenda.html?n=' + encodeURIComponent(x.numero) + '">' + e(x.numero) + "</a></td>" +
      "<td>" + e(x.cliente.nome) + "</td>" +
      "<td>" + RJSA.dataHora(x.data) + "</td>" +
      "<td>" + RJSA.estado(x.estado) + "</td>" +
      '<td class="num">' + RJSA.preco(x.total) + "</td></tr>";
  }).join("");

  /* ---------- Mais vendidos do mês ---------- */
  var vendidos = {};
  encMes.forEach(function (x) {
    x.itens.forEach(function (it) {
      vendidos[it.id] = vendidos[it.id] || { nome: it.nome, qtd: 0, total: 0 };
      vendidos[it.id].qtd += it.quantidade;
      vendidos[it.id].total += it.subtotal;
    });
  });
  var top = Object.keys(vendidos).map(function (k) { return Object.assign({ id: k }, vendidos[k]); })
    .sort(function (a, b) { return b.qtd - a.qtd; }).slice(0, 5);
  var topHtml = top.length
    ? top.map(function (t) {
        var p = db.produtos.filter(function (x) { return x.id === t.id; })[0];
        return '<tr><td><div class="produto-celula">' + RJSA.miniatura(p) + "<div><strong>" + e(t.nome) + "</strong><small>" + t.qtd + " vendidos</small></div></div></td>" +
          '<td class="num">' + RJSA.preco(t.total) + "</td></tr>";
      }).join("")
    : '<tr><td class="vazio-tabela">Ainda sem vendas este mês.</td></tr>';

  /* ---------- Stock baixo ---------- */
  var baixo = db.produtos.filter(function (p) { return p.ativo !== false && Number(p.stock) <= 3; })
    .sort(function (a, b) { return a.stock - b.stock; });
  var baixoHtml = baixo.length
    ? baixo.map(function (p) {
        return '<tr><td><div class="produto-celula">' + RJSA.miniatura(p) + "<div><strong>" + e(p.nome) + "</strong><small>" + e(p.sku || "") + "</small></div></div></td>" +
          '<td class="num"><span class="' + (Number(p.stock) === 0 ? "stock-zero" : "stock-baixo") + '">' + p.stock + " un.</span></td>" +
          '<td class="acoes"><a class="btn-icone" href="editar-produto.html?id=' + encodeURIComponent(p.id) + '" aria-label="Editar">' + ic.editar + "</a></td></tr>";
      }).join("")
    : '<tr><td class="vazio-tabela">Nenhum produto com stock baixo.</td></tr>';

  /* ---------- Desenhar ---------- */
  RJSA.avisosGerais().then(function (avisos) {
    conteudo.innerHTML =
      avisos +
      '<div class="kpis">' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.financeiro + "Vendas do mês</div>" +
      '<div class="kpi__valor">' + RJSA.preco(vendasMes) + "</div>" + variacao(vendasMes, vendasAnterior) + "</div>" +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.encomendas + "Encomendas do mês</div>" +
      '<div class="kpi__valor">' + encMes.length + "</div>" + variacao(encMes.length, encAnterior.length) + "</div>" +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.relogio + "Por confirmar</div>" +
      '<div class="kpi__valor">' + porConfirmar.length + '</div><div class="kpi__nota"><a class="ligacao" style="color:var(--cor-destaque);font-weight:600" href="encomendas.html?estado=Recebida">Ver e ligar aos clientes →</a></div></div>' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.tendencia + "Lucro estimado do mês</div>" +
      '<div class="kpi__valor">' + RJSA.preco(lucroMes) + '</div><div class="kpi__nota">Valor médio por encomenda: ' + RJSA.preco(ticket) + "</div></div>" +
      "</div>" +

      '<div class="grelha-admin grelha-admin--2" style="margin-bottom:20px">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Vendas dos últimos 14 dias</h2><a class="btn-adm" href="relatorios.html">Relatórios</a></div>' +
      '<div class="cartao__corpo">' + grafico + "</div></section>" +
      '<section class="cartao"><div class="cartao__topo"><h2>Encomendas por estado</h2></div><div class="cartao__corpo">' + estados + "</div></section>" +
      "</div>" +

      '<div class="grelha-admin grelha-admin--2">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Últimas encomendas</h2><a class="btn-adm" href="encomendas.html">Ver todas</a></div>' +
      '<div class="tabela-caixa"><table class="tabela"><thead><tr><th>Nº</th><th>Cliente</th><th>Data</th><th>Estado</th><th class="num">Total</th></tr></thead><tbody>' +
      (ultimas || '<tr><td colspan="5" class="vazio-tabela">Ainda não há encomendas.</td></tr>') + "</tbody></table></div></section>" +
      '<div class="grelha-admin">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Mais vendidos do mês</h2></div><div class="tabela-caixa"><table class="tabela"><tbody>' + topHtml + "</tbody></table></div></section>" +
      '<section class="cartao"><div class="cartao__topo"><h2>Stock baixo</h2><a class="btn-adm" href="produtos.html">Produtos</a></div><div class="tabela-caixa"><table class="tabela"><tbody>' + baixoHtml + "</tbody></table></div></section>" +
      "</div></div>";
  });
})();
