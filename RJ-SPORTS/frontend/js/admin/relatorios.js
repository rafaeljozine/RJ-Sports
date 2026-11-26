/* ==========================================================
   RJ SPORTS — Admin: relatórios de vendas
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "relatorios", titulo: "Relatórios" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();
  var periodo = "30";

  function noPeriodo(enc) {
    var d = new Date(enc.data);
    var agora = new Date();
    switch (periodo) {
      case "mes": return enc.data.slice(0, 7) === agora.toISOString().slice(0, 7);
      case "mes-anterior":
        return enc.data.slice(0, 7) === new Date(agora.getFullYear(), agora.getMonth() - 1, 15).toISOString().slice(0, 7);
      case "ano": return d.getFullYear() === agora.getFullYear();
      case "tudo": return true;
      default: return agora - d <= Number(periodo) * 86400000;
    }
  }

  function agrupar(lista, chave, valor) {
    var mapa = {};
    lista.forEach(function (x) {
      var k = chave(x);
      if (k == null) return;
      mapa[k] = (mapa[k] || 0) + valor(x);
    });
    return Object.keys(mapa).map(function (k) { return { nome: k, valor: mapa[k] }; })
      .sort(function (a, b) { return b.valor - a.valor; });
  }

  function barras(dados, formato) {
    if (!dados.length) return '<p class="campo__ajuda" style="margin:0">Sem vendas neste período.</p>';
    var max = dados[0].valor || 1;
    var total = dados.reduce(function (s, x) { return s + x.valor; }, 0) || 1;
    return '<div class="barras-h">' + dados.map(function (x) {
      return '<div><div class="barra-h__topo"><span>' + e(x.nome) + "</span><strong>" + formato(x.valor) +
        ' <small style="font-weight:400;color:var(--admin-texto-suave)">(' + Math.round((x.valor / total) * 100) + "%)</small></strong></div>" +
        '<div class="barra-h__trilho"><div class="barra-h__enchimento" style="width:' + (x.valor / max) * 100 + '%"></div></div></div>';
    }).join("") + "</div>";
  }

  function produtoPorId(id) {
    return db.produtos.filter(function (p) { return p.id === id; })[0];
  }

  function desenhar() {
    var todas = db.encomendas.filter(noPeriodo);
    var validas = todas.filter(function (x) { return x.estado !== "Cancelada"; });
    var canceladas = todas.length - validas.length;
    var vendas = validas.reduce(function (s, x) { return s + x.total; }, 0);
    var custo = validas.reduce(function (s, x) { return s + RJSA.custoEncomenda(x); }, 0);
    var unidades = validas.reduce(function (s, x) { return s + x.itens.reduce(function (s2, i) { return s2 + i.quantidade; }, 0); }, 0);

    var itens = [];
    validas.forEach(function (x) { x.itens.forEach(function (i) { itens.push(i); }); });

    var porCategoria = agrupar(itens, function (i) {
      var p = produtoPorId(i.id);
      var c = p && db.categorias.filter(function (k) { return k.id === p.categoria; })[0];
      return c ? c.nome : "Outros";
    }, function (i) { return i.subtotal; });

    var porPublico = agrupar(itens, function (i) {
      var p = produtoPorId(i.id);
      if (!p || !p.publico || !p.publico.length) return "Sem público definido";
      if (p.publico.length > 1) return "Vários (unissexo)";
      var pb = RJS.obterPublico(p.publico[0]);
      return pb ? pb.nome : p.publico[0];
    }, function (i) { return i.subtotal; });

    var porProvincia = agrupar(validas, function (x) { return x.cliente.provincia; }, function (x) { return x.total; });
    var porPagamento = agrupar(validas, function (x) { return x.pagamento; }, function () { return 1; });

    var produtos = {};
    itens.forEach(function (i) {
      var k = i.id;
      produtos[k] = produtos[k] || { id: i.id, nome: i.nome, qtd: 0, total: 0, custo: 0 };
      produtos[k].qtd += i.quantidade;
      produtos[k].total += i.subtotal;
      produtos[k].custo += (Number(i.custo) || 0) * i.quantidade;
    });
    var top = Object.keys(produtos).map(function (k) { return produtos[k]; })
      .sort(function (a, b) { return b.total - a.total; });

    conteudo.querySelector("#relatorio").innerHTML =
      '<div class="kpis">' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.financeiro + 'Vendas</div><div class="kpi__valor">' + RJSA.preco(vendas) + '</div><div class="kpi__nota">Lucro bruto: ' + RJSA.preco(vendas - custo) + "</div></div>" +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.encomendas + 'Encomendas</div><div class="kpi__valor">' + validas.length + '</div><div class="kpi__nota">' + unidades + " artigos vendidos</div></div>" +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.tendencia + 'Valor médio</div><div class="kpi__valor">' + RJSA.preco(validas.length ? vendas / validas.length : 0) + '</div><div class="kpi__nota">por encomenda</div></div>' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.aviso + 'Canceladas</div><div class="kpi__valor">' + canceladas + '</div><div class="kpi__nota">' +
      (todas.length ? Math.round((canceladas / todas.length) * 100) + "% das encomendas" : "—") + "</div></div>" +
      "</div>" +

      '<div class="grelha-admin grelha-admin--metade" style="margin-bottom:20px">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Vendas por categoria</h2></div><div class="cartao__corpo">' + barras(porCategoria, RJSA.preco) + "</div></section>" +
      '<section class="cartao"><div class="cartao__topo"><h2>Vendas por público</h2></div><div class="cartao__corpo">' + barras(porPublico, RJSA.preco) + "</div></section>" +
      '<section class="cartao"><div class="cartao__topo"><h2>Vendas por província</h2></div><div class="cartao__corpo">' + barras(porProvincia, RJSA.preco) + "</div></section>" +
      '<section class="cartao"><div class="cartao__topo"><h2>Forma de pagamento preferida</h2></div><div class="cartao__corpo">' +
      barras(porPagamento, function (n) { return n + " enc."; }) + "</div></section>" +
      "</div>" +

      '<section class="cartao"><div class="cartao__topo"><h2>Produtos mais vendidos</h2><button class="btn-adm" data-exportar>' + ic.descarregar + " Exportar CSV</button></div>" +
      '<div class="tabela-caixa"><table class="tabela"><thead><tr><th>#</th><th>Produto</th><th class="num">Unidades</th><th class="num">Vendas</th><th class="num">Lucro bruto</th></tr></thead><tbody>' +
      (top.length
        ? top.slice(0, 15).map(function (t, n) {
            return "<tr><td>" + (n + 1) + '</td><td><div class="produto-celula">' + RJSA.miniatura(produtoPorId(t.id)) + "<div><strong>" + e(t.nome) + "</strong></div></div></td>" +
              '<td class="num">' + t.qtd + '</td><td class="num"><strong>' + RJSA.preco(t.total) + '</strong></td><td class="num">' + (t.custo ? RJSA.preco(t.total - t.custo) : "—") + "</td></tr>";
          }).join("")
        : '<tr><td colspan="5" class="vazio-tabela">Sem vendas neste período.</td></tr>') +
      "</tbody></table></div></section>";

    conteudo._top = top;
  }

  conteudo.innerHTML =
    '<div class="ferramentas"><label for="periodo" style="font-weight:600;font-size:.875rem">Período</label>' +
    '<select id="periodo"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="90">Últimos 90 dias</option>' +
    '<option value="mes">Este mês</option><option value="mes-anterior">Mês anterior</option><option value="ano">Este ano</option><option value="tudo">Desde o início</option></select>' +
    '<span class="campo__ajuda">Encomendas canceladas não contam para as vendas.</span></div>' +
    '<div id="relatorio"></div>';

  conteudo.addEventListener("change", function (ev) {
    if (ev.target.id === "periodo") {
      periodo = ev.target.value;
      desenhar();
    }
  });

  conteudo.addEventListener("click", function (ev) {
    if (!ev.target.closest("[data-exportar]")) return;
    RJSA.csv(
      ["Produto", "Unidades", "Vendas (MT)", "Custo (MT)", "Lucro bruto (MT)"],
      (conteudo._top || []).map(function (t) { return [t.nome, t.qtd, t.total, t.custo || "", t.custo ? t.total - t.custo : ""]; }),
      "vendas-por-produto-rj-sports.csv"
    );
  });

  desenhar();
})();
