/* ==========================================================
   RJ SPORTS — Admin: clientes
   Os clientes são criados automaticamente a partir das
   encomendas (agrupados pelo número de telefone).
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "clientes", titulo: "Clientes" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();
  var filtro = { q: RJSA.parametro("q") || "", ordem: "recente" };

  function chaveTelefone(t) {
    var d = String(t || "").replace(/\D/g, "");
    return d.length === 12 && d.indexOf("258") === 0 ? d.slice(3) : d;
  }

  /* Agrupar encomendas por cliente */
  var mapa = {};
  db.encomendas.forEach(function (enc) {
    var k = chaveTelefone(enc.cliente.telefone) || enc.cliente.nome;
    var c = mapa[k];
    if (!c) {
      c = mapa[k] = {
        nome: enc.cliente.nome,
        telefone: enc.cliente.telefone,
        provincia: enc.cliente.provincia,
        cidade: enc.cliente.cidade,
        encomendas: 0,
        canceladas: 0,
        gasto: 0,
        primeira: enc.data,
        ultima: enc.data
      };
    }
    c.encomendas++;
    if (enc.estado === "Cancelada") c.canceladas++;
    else c.gasto += enc.total;
    if (enc.data > c.ultima) {
      c.ultima = enc.data;
      c.nome = enc.cliente.nome;
      c.provincia = enc.cliente.provincia;
      c.cidade = enc.cliente.cidade;
    }
    if (enc.data < c.primeira) c.primeira = enc.data;
  });
  var clientes = Object.keys(mapa).map(function (k) { return mapa[k]; });

  function filtrados() {
    var t = RJSA.slug(filtro.q).replace(/-/g, "");
    var lista = clientes.filter(function (c) {
      if (!t) return true;
      return RJSA.slug(c.nome + c.telefone + c.provincia).replace(/-/g, "").indexOf(t) > -1;
    });
    var ordens = {
      recente: function (a, b) { return b.ultima.localeCompare(a.ultima); },
      gasto: function (a, b) { return b.gasto - a.gasto; },
      encomendas: function (a, b) { return b.encomendas - a.encomendas; },
      nome: function (a, b) { return a.nome.localeCompare(b.nome, "pt"); }
    };
    return lista.sort(ordens[filtro.ordem]);
  }

  function desenhar() {
    var lista = filtrados();
    conteudo.querySelector("tbody").innerHTML = lista.length
      ? lista.map(function (c) {
          var fiel = c.encomendas - c.canceladas >= 2;
          return "<tr>" +
            "<td><strong>" + e(c.nome) + "</strong>" + (fiel ? ' <span class="estado estado--ativo" style="margin-left:6px">Cliente habitual</span>' : "") + "</td>" +
            "<td>" + e(c.telefone) + "</td>" +
            "<td>" + e(c.provincia) + "<br><small>" + e(c.cidade || "") + "</small></td>" +
            '<td class="num">' + c.encomendas + (c.canceladas ? '<br><small style="color:var(--estado-cancelada)">' + c.canceladas + " cancelada(s)</small>" : "") + "</td>" +
            '<td class="num"><strong>' + RJSA.preco(c.gasto) + "</strong></td>" +
            "<td>" + RJSA.data(c.ultima) + "</td>" +
            '<td class="acoes">' +
            '<a class="btn-icone" style="color:#25d366" target="_blank" rel="noopener" href="' + RJSA.linkWhatsapp(c.telefone, "Olá " + c.nome.split(" ")[0] + "! Somos a RJ Sports.") + '" aria-label="WhatsApp" title="WhatsApp">' + ic.whatsapp + "</a>" +
            '<a class="btn-icone" href="encomendas.html?q=' + encodeURIComponent(chaveTelefone(c.telefone)) + '" aria-label="Ver encomendas" title="Ver encomendas">' + ic.encomendas + "</a>" +
            "</td></tr>";
        }).join("")
      : '<tr><td colspan="7" class="vazio-tabela">Nenhum cliente encontrado.</td></tr>';

    var total = lista.reduce(function (s, c) { return s + c.gasto; }, 0);
    conteudo.querySelector("[data-resumo]").textContent =
      lista.length + " cliente(s) · " + RJSA.preco(total) + " em compras";
  }

  var habituais = clientes.filter(function (c) { return c.encomendas - c.canceladas >= 2; }).length;
  var mediaGasto = clientes.length ? clientes.reduce(function (s, c) { return s + c.gasto; }, 0) / clientes.length : 0;

  conteudo.innerHTML =
    '<div class="kpis">' +
    '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.clientes + 'Clientes</div><div class="kpi__valor">' + clientes.length + "</div></div>" +
    '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.tendencia + 'Clientes habituais</div><div class="kpi__valor">' + habituais + '</div><div class="kpi__nota">2 ou mais encomendas</div></div>' +
    '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.financeiro + 'Gasto médio por cliente</div><div class="kpi__valor">' + RJSA.preco(mediaGasto) + "</div></div>" +
    '<div class="cartao kpi"><div class="kpi__rotulo">' + ic.entregas + 'Províncias</div><div class="kpi__valor">' +
    Object.keys(clientes.reduce(function (o, c) { o[c.provincia] = 1; return o; }, {})).length + "</div></div>" +
    "</div>" +
    '<div class="ferramentas">' +
    '<label class="ferramentas__pesquisa">' + ic.pesquisa + '<input type="search" placeholder="Nome, telefone ou província" data-filtro="q" value="' + e(filtro.q) + '"></label>' +
    '<select data-filtro="ordem" aria-label="Ordenar"><option value="recente">Compra mais recente</option><option value="gasto">Mais gasto</option><option value="encomendas">Mais encomendas</option><option value="nome">Nome A–Z</option></select>' +
    '<div class="ferramentas__direita"><button class="btn-adm" data-exportar>' + ic.descarregar + " Exportar CSV</button></div>" +
    "</div>" +
    '<div class="cartao"><div class="tabela-caixa"><table class="tabela"><thead><tr>' +
    '<th>Cliente</th><th>Telefone</th><th>Província</th><th class="num">Encomendas</th><th class="num">Total gasto</th><th>Última compra</th><th class="acoes"></th>' +
    "</tr></thead><tbody></tbody></table></div>" +
    '<div class="paginacao"><span data-resumo></span><span>Criados automaticamente a partir das encomendas.</span></div></div>';

  conteudo.addEventListener("input", function (ev) {
    var f = ev.target.getAttribute("data-filtro");
    if (f) {
      filtro[f] = ev.target.value;
      desenhar();
    }
  });

  conteudo.addEventListener("click", function (ev) {
    if (!ev.target.closest("[data-exportar]")) return;
    RJSA.csv(
      ["Nome", "Telefone", "Província", "Cidade", "Encomendas", "Canceladas", "Total gasto (MT)", "Primeira compra", "Última compra"],
      filtrados().map(function (c) {
        return [c.nome, c.telefone, c.provincia, c.cidade, c.encomendas, c.canceladas, c.gasto,
          new Date(c.primeira).toLocaleDateString("pt-PT"), new Date(c.ultima).toLocaleDateString("pt-PT")];
      }),
      "clientes-rj-sports.csv"
    );
  });

  desenhar();
})();
