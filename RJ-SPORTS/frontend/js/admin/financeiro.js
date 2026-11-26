/* ==========================================================
   RJ SPORTS — Admin: financeiro
   Receita = encomendas entregues (pagas na entrega)
   Lucro   = receita − custo dos produtos − despesas
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "financeiro", titulo: "Financeiro" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();
  var mes = new Date().toISOString().slice(0, 7);

  function soma(lista, f) {
    return lista.reduce(function (s, x) { return s + (Number(f(x)) || 0); }, 0);
  }

  function contas(m) {
    var entregues = db.encomendas.filter(function (x) { return x.estado === "Entregue" && x.data.slice(0, 7) === m; });
    var receita = soma(entregues, function (x) { return x.total; });
    var custo = soma(entregues, RJSA.custoEncomenda);
    var despesas = soma(db.despesas.filter(function (d) { return (d.data || "").slice(0, 7) === m; }), function (d) { return d.valor; });
    return {
      encomendas: entregues.length,
      receita: receita,
      custo: custo,
      despesas: despesas,
      taxas: soma(entregues, function (x) { return x.taxaEntrega; }),
      lucro: receita - custo - despesas
    };
  }

  function nomeMes(m) {
    var partes = m.split("-");
    return new Date(Number(partes[0]), Number(partes[1]) - 1, 1).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
  }

  function desenharResumo() {
    var c = contas(mes);
    var porReceber = db.encomendas.filter(function (x) { return x.estado === "Enviada"; });
    var valorPorReceber = soma(porReceber, function (x) { return x.total + (Number(x.taxaEntrega) || 0); });

    var meses = [];
    var d = new Date();
    for (var i = 5; i >= 0; i--) {
      meses.push(new Date(d.getFullYear(), d.getMonth() - i, 15).toISOString().slice(0, 7));
    }

    document.getElementById("resumo-financeiro").innerHTML =
      '<div class="kpis">' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.financeiro + "Receita</div>" +
      '<div class="kpi__valor">' + RJSA.preco(c.receita) + '</div><div class="kpi__nota">' + c.encomendas + " encomenda(s) entregue(s)</div></div>" +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.fornecedores + "Custo dos produtos</div>" +
      '<div class="kpi__valor">' + RJSA.preco(c.custo) + '</div><div class="kpi__nota">Pago aos fornecedores</div></div>' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.caixa + "Despesas</div>" +
      '<div class="kpi__valor">' + RJSA.preco(c.despesas) + '</div><div class="kpi__nota">Publicidade, embalagens, etc.</div></div>' +
      '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.tendencia + "Lucro</div>" +
      '<div class="kpi__valor" style="color:' + (c.lucro >= 0 ? "var(--estado-entregue)" : "var(--estado-cancelada)") + '">' + RJSA.preco(c.lucro) + "</div>" +
      '<div class="kpi__nota">' + (c.receita ? Math.round((c.lucro / c.receita) * 100) + "% da receita" : "—") + "</div></div>" +
      "</div>" +

      '<div class="grelha-admin grelha-admin--2" style="margin-bottom:28px">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Últimos 6 meses</h2></div><div class="tabela-caixa"><table class="tabela">' +
      '<thead><tr><th>Mês</th><th class="num">Receita</th><th class="num">Custo</th><th class="num">Despesas</th><th class="num">Lucro</th></tr></thead><tbody>' +
      meses.reverse().map(function (m) {
        var x = contas(m);
        return "<tr" + (m === mes ? ' style="background:#f0f5ff"' : "") + "><td>" + e(nomeMes(m)) + "</td>" +
          '<td class="num">' + RJSA.preco(x.receita) + '</td><td class="num">' + RJSA.preco(x.custo) + '</td><td class="num">' + RJSA.preco(x.despesas) + "</td>" +
          '<td class="num"><strong style="color:' + (x.lucro >= 0 ? "var(--estado-entregue)" : "var(--estado-cancelada)") + '">' + RJSA.preco(x.lucro) + "</strong></td></tr>";
      }).join("") +
      "</tbody></table></div></section>" +
      '<section class="cartao"><div class="cartao__topo"><h2>Dinheiro a caminho</h2></div><div class="cartao__corpo">' +
      '<div class="kpi__valor" style="margin:0">' + RJSA.preco(valorPorReceber) + "</div>" +
      '<p class="campo__ajuda" style="margin:6px 0 16px">' + porReceber.length + " encomenda(s) enviada(s), a cobrar na entrega (produtos + entrega).</p>" +
      '<div class="linha-total"><span>Taxas de entrega cobradas em ' + e(nomeMes(mes)) + "</span><strong>" + RJSA.preco(c.taxas) + "</strong></div>" +
      '<p class="campo__ajuda" style="margin:6px 0 0">As taxas de entrega não entram no lucro: normalmente pagam o estafeta ou a transportadora.</p>' +
      "</div></section></div>";
  }

  conteudo.innerHTML =
    '<div class="ferramentas"><label for="mes" style="font-weight:600;font-size:.875rem">Mês</label>' +
    '<input type="month" id="mes" value="' + mes + '"></div>' +
    '<div id="resumo-financeiro"></div>' +
    '<h2 style="font-family:var(--fonte-corpo);font-size:1.0625rem;text-transform:none;letter-spacing:0;margin:0 0 12px">Despesas</h2>' +
    '<div id="despesas"></div>';

  document.getElementById("mes").addEventListener("change", function (ev) {
    mes = ev.target.value || new Date().toISOString().slice(0, 7);
    desenharResumo();
  });

  desenharResumo();

  RJSA.crud({
    alvo: document.getElementById("despesas"),
    colecao: "despesas",
    prefixo: "desp",
    novoRotulo: "Nova despesa",
    tituloNovo: "Nova despesa",
    tituloEditar: "Editar despesa",
    vazio: "Ainda não há despesas registadas.",
    pesquisar: function (d) { return d.descricao + " " + d.categoria; },
    nome: function (d) { return d.descricao; },
    ordenar: function (a, b) { return (b.data || "").localeCompare(a.data || ""); },
    campos: [
      { id: "descricao", rotulo: "Descrição", obrigatorio: true, inteiro: true, placeholder: "Ex.: Anúncios no Instagram" },
      { id: "data", rotulo: "Data", tipo: "date", obrigatorio: true, padrao: new Date().toISOString().slice(0, 10) },
      { id: "valor", rotulo: "Valor", tipo: "number", min: 0, passo: 10, sufixo: "MT", obrigatorio: true,
        validar: function (v) { return v > 0; }, erro: "Indique um valor maior que zero." },
      { id: "categoria", rotulo: "Categoria", tipo: "select", opcoes: ["Marketing", "Operação", "Transporte", "Comunicações", "Outros"], inteiro: true }
    ],
    aoMudar: desenharResumo,
    colunas: [
      { rotulo: "Data", valor: function (d) { return RJSA.data(d.data); } },
      { rotulo: "Descrição", valor: function (d) { return "<strong>" + e(d.descricao) + "</strong>"; } },
      { rotulo: "Categoria", valor: function (d) { return e(d.categoria || "—"); } },
      { rotulo: "Valor", classe: "num", valor: function (d) { return RJSA.preco(d.valor); } }
    ]
  });
})();
