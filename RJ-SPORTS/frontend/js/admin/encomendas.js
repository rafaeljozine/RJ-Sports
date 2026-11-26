/* ==========================================================
   RJ SPORTS — Admin: encomendas
   - encomendas.html                 → lista com estados e filtros
   - detalhes-encomenda.html?n=RJS-… → detalhe, estado, fornecedor, cliente
   ========================================================== */

(function () {
  var pagina = document.body.getAttribute("data-pagina");
  var e = RJSA.e;
  var ic = RJSA.icones;

  if (pagina === "encomendas") lista();
  else detalhes();

  /** Muda o estado, regista no histórico e atualiza a página "Acompanhar" da loja */
  function mudarEstado(enc, novo, nota) {
    if (enc.estado === novo && !nota) return false;
    enc.estado = novo;
    enc.historico = enc.historico || [];
    enc.historico.push({ estado: novo, data: new Date().toISOString(), nota: nota || "" });
    if (novo === "Confirmada" || novo === "Enviada") enc.pedidoFornecedor = enc.pedidoFornecedor || novo === "Enviada";
    RJSA.db.guardar();
    RJSA.sincronizarEstadoLoja(enc);
    return true;
  }

  function mensagemCliente(enc) {
    var c = enc.cliente;
    var primeiro = (c.nome || "").split(" ")[0];
    var artigos = enc.itens.map(function (i) {
      return "• " + i.quantidade + "x " + i.nome + (i.tamanho ? " (" + i.tamanho + ")" : "");
    }).join("\n");
    var taxa = enc.taxaEntrega != null ? RJSA.preco(enc.taxaEntrega) : "a confirmar";
    var totalFinal = RJSA.preco(enc.total + (Number(enc.taxaEntrega) || 0));
    switch (enc.estado) {
      case "Enviada":
        return "Olá " + primeiro + "! A sua encomenda " + enc.numero + " da RJ Sports já está a caminho. Tenha à mão " + totalFinal + " para pagar na entrega (" + enc.pagamento + "). Obrigado!";
      case "Entregue":
        return "Olá " + primeiro + "! Obrigado por comprar na RJ Sports. Esperamos que goste da sua encomenda " + enc.numero + ". Qualquer questão, estamos por aqui!";
      case "Cancelada":
        return "Olá " + primeiro + ". A sua encomenda " + enc.numero + " na RJ Sports foi cancelada. Se precisar de ajuda, fale connosco.";
      default:
        return "Olá " + primeiro + "! Somos a RJ Sports. Recebemos a sua encomenda " + enc.numero + ":\n" + artigos +
          "\n\nProdutos: " + RJSA.preco(enc.total) +
          (enc.desconto ? " (já com o desconto " + enc.codigoDesconto + " de " + RJSA.preco(enc.desconto) + ")" : "") +
          "\nEntrega: " + taxa + "\nTotal a pagar na entrega: " + totalFinal +
          "\nPagamento: " + enc.pagamento + "\n\nPodemos confirmar a encomenda?";
    }
  }

  /* ==========================================================
     LISTA
     ========================================================== */
  function lista() {
    var conteudo = RJSA.montar({ pagina: "encomendas", titulo: "Encomendas" });
    if (!conteudo) return;
    var db = RJSA.db.obter();
    var filtro = { estado: RJSA.parametro("estado") || "", q: RJSA.parametro("q") || "", periodo: "", provincia: "" };

    function noPeriodo(enc) {
      if (!filtro.periodo) return true;
      var d = new Date(enc.data);
      var agora = new Date();
      if (filtro.periodo === "hoje") return d.toDateString() === agora.toDateString();
      if (filtro.periodo === "mes") return enc.data.slice(0, 7) === agora.toISOString().slice(0, 7);
      return agora - d <= Number(filtro.periodo) * 86400000;
    }

    function filtradas(ignorarEstado) {
      var t = RJSA.slug(filtro.q);
      return db.encomendas.filter(function (x) {
        if (!ignorarEstado && filtro.estado && x.estado !== filtro.estado) return false;
        if (filtro.provincia && x.cliente.provincia !== filtro.provincia) return false;
        if (!noPeriodo(x)) return false;
        if (t) {
          var texto = RJSA.slug(x.numero + " " + x.cliente.nome + " " + x.cliente.telefone.replace(/\s/g, ""));
          t = t.replace(/-/g, "");
          texto = texto.replace(/-/g, "");
          if (texto.indexOf(t) === -1) return false;
        }
        return true;
      });
    }

    function desenhar() {
      var base = filtradas(true);
      conteudo.querySelector(".separadores").innerHTML =
        ['', ].concat(RJSA.ESTADOS).map(function (s) {
          var n = s ? base.filter(function (x) { return x.estado === s; }).length : base.length;
          return '<button class="' + (filtro.estado === s ? "ativo" : "") + '" data-estado="' + e(s) + '">' + (s || "Todas") + "<span>" + n + "</span></button>";
        }).join("");

      var itens = filtradas(false);
      conteudo.querySelector("tbody").innerHTML = itens.length
        ? itens.map(function (x) {
            var artigos = x.itens.reduce(function (s, i) { return s + i.quantidade; }, 0);
            return "<tr>" +
              '<td><a class="ligacao" href="detalhes-encomenda.html?n=' + encodeURIComponent(x.numero) + '">' + e(x.numero) + "</a></td>" +
              "<td>" + RJSA.dataHora(x.data) + "</td>" +
              "<td><strong>" + e(x.cliente.nome) + "</strong><br><small>" + e(x.cliente.telefone) + "</small></td>" +
              "<td>" + e(x.cliente.provincia) + "</td>" +
              '<td class="num">' + artigos + "</td>" +
              '<td class="num"><strong>' + RJSA.preco(x.total) + "</strong></td>" +
              '<td><select data-mudar="' + e(x.numero) + '" aria-label="Estado da encomenda ' + e(x.numero) + '" style="min-height:32px;border:1px solid var(--admin-borda);border-radius:6px;padding:0 6px">' +
              RJSA.ESTADOS.map(function (s) { return "<option" + (s === x.estado ? " selected" : "") + ">" + s + "</option>"; }).join("") +
              "</select></td>" +
              '<td class="acoes">' +
              '<a class="btn-icone" href="' + RJSA.linkWhatsapp(x.cliente.telefone, mensagemCliente(x)) + '" target="_blank" rel="noopener" aria-label="WhatsApp do cliente" title="WhatsApp do cliente" style="color:#25d366">' + ic.whatsapp + "</a>" +
              '<a class="btn-icone" href="detalhes-encomenda.html?n=' + encodeURIComponent(x.numero) + '" aria-label="Ver detalhes" title="Ver detalhes">' + ic.ver + "</a>" +
              "</td></tr>";
          }).join("")
        : '<tr><td colspan="8" class="vazio-tabela">Nenhuma encomenda encontrada.</td></tr>';

      var total = itens.reduce(function (s, x) { return s + (x.estado === "Cancelada" ? 0 : x.total); }, 0);
      conteudo.querySelector("[data-resumo]").textContent =
        itens.length + " encomenda(s) · " + RJSA.preco(total) + " em produtos (sem canceladas)";
    }

    conteudo.innerHTML =
      '<div class="separadores" role="tablist" aria-label="Estado"></div>' +
      '<div class="ferramentas">' +
      '<label class="ferramentas__pesquisa">' + ic.pesquisa + '<input type="search" placeholder="Nº, nome ou telefone" data-filtro="q" value="' + e(filtro.q) + '"></label>' +
      '<select data-filtro="periodo" aria-label="Período"><option value="">Qualquer data</option><option value="hoje">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="mes">Este mês</option></select>' +
      '<select data-filtro="provincia" aria-label="Província"><option value="">Todas as províncias</option>' +
      RJSA.PROVINCIAS.map(function (p) { return "<option>" + p + "</option>"; }).join("") + "</select>" +
      '<div class="ferramentas__direita"><button class="btn-adm" data-exportar>' + ic.descarregar + " Exportar CSV</button></div>" +
      "</div>" +
      '<div class="cartao"><div class="tabela-caixa"><table class="tabela"><thead><tr>' +
      '<th>Nº</th><th>Data</th><th>Cliente</th><th>Província</th><th class="num">Artigos</th><th class="num">Total</th><th>Estado</th><th class="acoes"></th>' +
      "</tr></thead><tbody></tbody></table></div>" +
      '<div class="paginacao"><span data-resumo></span><span>Mude o estado diretamente na tabela.</span></div></div>';

    conteudo.addEventListener("click", function (ev) {
      var sep = ev.target.closest("[data-estado]");
      if (sep) {
        filtro.estado = sep.getAttribute("data-estado");
        desenhar();
      }
      if (ev.target.closest("[data-exportar]")) {
        RJSA.csv(
          ["Número", "Data", "Estado", "Cliente", "Telefone", "Província", "Cidade", "Bairro", "Morada", "Pagamento", "Artigos", "Total produtos (MT)", "Taxa entrega (MT)"],
          filtradas(false).map(function (x) {
            return [x.numero, new Date(x.data).toLocaleString("pt-PT"), x.estado, x.cliente.nome, x.cliente.telefone, x.cliente.provincia,
              x.cliente.cidade, x.cliente.bairro, x.cliente.endereco, x.pagamento,
              x.itens.map(function (i) { return i.quantidade + "x " + i.nome + (i.tamanho ? " (" + i.tamanho + ")" : ""); }).join(" | "),
              x.total, x.taxaEntrega == null ? "" : x.taxaEntrega];
          }),
          "encomendas-rj-sports.csv"
        );
      }
    });

    conteudo.addEventListener("input", function (ev) {
      var f = ev.target.getAttribute("data-filtro");
      if (f) {
        filtro[f] = ev.target.value;
        desenhar();
      }
    });

    conteudo.addEventListener("change", function (ev) {
      var numero = ev.target.getAttribute("data-mudar");
      if (!numero) return;
      var enc = db.encomendas.filter(function (x) { return x.numero === numero; })[0];
      mudarEstado(enc, ev.target.value, "");
      RJSA.aviso(numero + " → " + ev.target.value);
      desenhar();
    });

    desenhar();
  }

  /* ==========================================================
     DETALHES
     ========================================================== */
  function detalhes() {
    var numero = RJSA.parametro("n");
    var conteudo = RJSA.montar({
      pagina: "encomendas",
      titulo: "Encomenda " + (numero || ""),
      acoes: '<a class="btn-adm" href="encomendas.html">' + ic.voltar + " Encomendas</a>" +
        '<button class="btn-adm" onclick="window.print()">' + ic.imprimir + " Imprimir</button>"
    });
    if (!conteudo) return;
    var db = RJSA.db.obter();
    var enc = db.encomendas.filter(function (x) { return x.numero === numero; })[0];

    if (!enc) {
      conteudo.innerHTML = '<div class="cartao"><div class="vazio-tabela">Encomenda não encontrada. <a class="ligacao" href="encomendas.html">Voltar à lista</a></div></div>';
      return;
    }

    var cores = { Recebida: "var(--estado-recebida)", Confirmada: "var(--estado-confirmada)", Enviada: "var(--estado-enviada)", Entregue: "var(--estado-entregue)", Cancelada: "var(--estado-cancelada)" };

    function fornecedorDe(idProduto) {
      var p = db.produtos.filter(function (x) { return x.id === idProduto; })[0];
      var f = p && db.fornecedores.filter(function (x) { return x.id === p.fornecedorId; })[0];
      return f || null;
    }

    function textoFornecedor() {
      var c = enc.cliente;
      return "Pedido " + enc.numero + " (RJ Sports)\n" +
        enc.itens.map(function (i) { return "• " + i.quantidade + "x " + i.nome + (i.tamanho ? " — tamanho " + i.tamanho : ""); }).join("\n") +
        "\n\nEntregar a: " + c.nome + "\nTelefone: " + c.telefone + "\nMorada: " + c.endereco + ", " + c.bairro + ", " + c.cidade + " — " + c.provincia +
        (c.observacoes ? "\nObservações: " + c.observacoes : "");
    }

    function desenhar() {
      var c = enc.cliente;
      var custo = RJSA.custoEncomenda(enc);
      var taxa = Number(enc.taxaEntrega) || 0;
      var temCusto = enc.itens.some(function (i) { return i.custo != null; });

      var itens = enc.itens.map(function (i) {
        var p = db.produtos.filter(function (x) { return x.id === i.id; })[0];
        var f = fornecedorDe(i.id);
        return "<tr>" +
          '<td><div class="produto-celula">' + RJSA.miniatura(p) + "<div><strong>" + e(i.nome) + "</strong><small>" +
          (i.tamanho ? "Tamanho " + e(i.tamanho) + " · " : "") + (f ? e(f.nome) : "Sem fornecedor") + "</small></div></div></td>" +
          '<td class="num">' + i.quantidade + "</td>" +
          '<td class="num">' + RJSA.preco(i.preco) + "</td>" +
          '<td class="num">' + (i.custo != null ? RJSA.preco(i.custo * i.quantidade) : "—") + "</td>" +
          '<td class="num"><strong>' + RJSA.preco(i.subtotal) + "</strong></td></tr>";
      }).join("");

      var historico = (enc.historico || []).slice().reverse().map(function (h) {
        return '<li style="--cor:' + (cores[h.estado] || "var(--estado-recebida)") + '"><strong>' + e(h.estado) + "</strong><small>" + RJSA.dataHora(h.data) + "</small>" +
          (h.nota ? '<div style="margin-top:2px">' + e(h.nota) + "</div>" : "") + "</li>";
      }).join("");

      var fornecedores = [];
      enc.itens.forEach(function (i) {
        var f = fornecedorDe(i.id);
        if (f && fornecedores.indexOf(f) === -1) fornecedores.push(f);
      });

      conteudo.innerHTML =
        '<div class="ferramentas nao-imprimir" style="margin-bottom:20px">' +
        "<div>" + RJSA.estado(enc.estado) + ' <span style="margin-left:8px;color:var(--admin-texto-suave);font-size:.875rem">Feita a ' + RJSA.dataHora(enc.data) + (enc.exemplo ? " · dados de exemplo" : "") + "</span></div>" +
        '<div class="ferramentas__direita">' +
        '<a class="btn-adm btn-adm--whatsapp" target="_blank" rel="noopener" href="' + RJSA.linkWhatsapp(c.telefone, mensagemCliente(enc)) + '">' + ic.whatsapp + " WhatsApp ao cliente</a>" +
        '<a class="btn-adm" href="tel:' + e(c.telefone.replace(/\s/g, "")) + '">' + ic.telefone + " Ligar</a>" +
        "</div></div>" +

        '<div class="grelha-admin grelha-admin--2" style="align-items:start">' +
        '<div class="grelha-admin">' +

        '<section class="cartao"><div class="cartao__topo"><h2>Artigos</h2></div>' +
        '<div class="tabela-caixa"><table class="tabela"><thead><tr><th>Produto</th><th class="num">Qtd</th><th class="num">Preço</th><th class="num">Custo</th><th class="num">Subtotal</th></tr></thead>' +
        "<tbody>" + itens + "</tbody></table></div>" +
        '<div class="cartao__corpo" style="border-top:1px solid var(--admin-borda)">' +
        (enc.desconto
          ? '<div class="linha-total"><span>Produtos</span><span>' + RJSA.preco(enc.total + enc.desconto) + "</span></div>" +
            '<div class="linha-total" style="color:var(--estado-entregue)"><span>Desconto (' + e(enc.codigoDesconto || "código") + ")</span><span>− " + RJSA.preco(enc.desconto) + "</span></div>"
          : '<div class="linha-total"><span>Produtos</span><span>' + RJSA.preco(enc.total) + "</span></div>") +
        '<div class="linha-total" style="align-items:center"><label for="taxa">Taxa de entrega</label>' +
        '<span class="campo-prefixo nao-imprimir" style="width:150px"><input id="taxa" type="number" min="0" step="10" value="' + (enc.taxaEntrega == null ? "" : enc.taxaEntrega) + '" placeholder="A definir" style="width:100%;min-height:36px;padding:0 40px 0 10px;border:1px solid var(--admin-borda);border-radius:6px;text-align:right"><span>MT</span></span></div>' +
        '<div class="linha-total linha-total--grande"><span>Total a cobrar na entrega</span><span>' + RJSA.preco(enc.total + taxa) + "</span></div>" +
        (temCusto
          ? '<div class="linha-total" style="color:var(--admin-texto-suave)"><span>Custo dos produtos (fornecedor)</span><span>− ' + RJSA.preco(custo) + "</span></div>" +
            '<div class="linha-total" style="font-weight:700;color:var(--estado-entregue)"><span>Lucro estimado</span><span>' + RJSA.preco(enc.total - custo) + "</span></div>"
          : "") +
        "</div></section>" +

        '<section class="cartao nao-imprimir"><div class="cartao__topo"><h2>Fornecedor (dropshipping)</h2></div><div class="cartao__corpo grelha-admin" style="gap:14px">' +
        '<label class="interruptor"><input type="checkbox" id="pedido-fornecedor"' + (enc.pedidoFornecedor ? " checked" : "") +
        '><span class="interruptor__trilho"></span><span>Pedido já feito ao fornecedor</span></label>' +
        (fornecedores.length
          ? fornecedores.map(function (f) {
              return '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><strong style="margin-right:auto">' + e(f.nome) + "</strong>" +
                (f.telefone ? '<a class="btn-adm btn-adm--whatsapp" target="_blank" rel="noopener" href="' + RJSA.linkWhatsapp(f.telefone, textoFornecedor()) + '">' + ic.whatsapp + " Enviar pedido</a>" : "") +
                "</div>";
            }).join("")
          : '<p class="campo__ajuda" style="margin:0">Os produtos desta encomenda não têm fornecedor associado.</p>') +
        '<button class="btn-adm" data-copiar>' + ic.duplicar + " Copiar pedido para o fornecedor</button>" +
        "</div></section>" +

        '<section class="cartao nao-imprimir"><div class="cartao__topo"><h2>Notas internas</h2></div><div class="cartao__corpo form-admin">' +
        '<div class="campo"><textarea id="notas" placeholder="Só a equipa vê estas notas (ex.: cliente pediu para ligar depois das 17h)">' + e(enc.notas || "") + "</textarea></div>" +
        '<div><button class="btn-adm" data-guardar-notas>Guardar notas</button></div></div></section>' +
        "</div>" +

        '<div class="grelha-admin">' +
        '<section class="cartao nao-imprimir"><div class="cartao__topo"><h2>Estado</h2></div><div class="cartao__corpo form-admin" style="gap:12px">' +
        '<div class="campo"><label for="novo-estado">Mudar para</label><select id="novo-estado">' +
        RJSA.ESTADOS.map(function (s) { return "<option" + (s === enc.estado ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>" +
        '<div class="campo"><label for="nota-estado">Nota <span style="font-weight:400;color:var(--admin-texto-suave)">(opcional)</span></label><input id="nota-estado" placeholder="Ex.: Enviado pela transportadora X"></div>' +
        '<button class="btn-adm btn-adm--primario" data-atualizar-estado>Atualizar estado</button>' +
        '<ul class="historico" style="margin-top:8px">' + historico + "</ul>" +
        "</div></section>" +

        '<section class="cartao"><div class="cartao__topo"><h2>Cliente</h2><a class="btn-adm nao-imprimir" href="clientes.html?q=' + encodeURIComponent(c.telefone) + '">Histórico</a></div><div class="cartao__corpo">' +
        '<dl class="detalhes"><dt>Nome</dt><dd>' + e(c.nome) + "</dd><dt>Telefone</dt><dd>" + e(c.telefone) + "</dd>" +
        (c.telefone2 ? "<dt>Outro contacto</dt><dd>" + e(c.telefone2) + "</dd>" : "") +
        "<dt>Pagamento</dt><dd>" + e(enc.pagamento) + " na entrega</dd></dl></div></section>" +

        '<section class="cartao"><div class="cartao__topo"><h2>Entrega</h2></div><div class="cartao__corpo">' +
        '<dl class="detalhes"><dt>Província</dt><dd>' + e(c.provincia) + "</dd><dt>Cidade</dt><dd>" + e(c.cidade) + "</dd>" +
        "<dt>Bairro</dt><dd>" + e(c.bairro) + "</dd><dt>Morada</dt><dd>" + e(c.endereco) + "</dd>" +
        (c.observacoes ? "<dt>Observações</dt><dd>" + e(c.observacoes) + "</dd>" : "") + "</dl></div></section>" +

        '<section class="cartao nao-imprimir"><div class="cartao__corpo"><button class="btn-adm btn-adm--perigo" data-apagar style="width:100%">' + ic.apagar + " Apagar encomenda</button></div></section>" +
        "</div></div>";
    }

    conteudo.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-atualizar-estado]")) {
        var novo = document.getElementById("novo-estado").value;
        var nota = document.getElementById("nota-estado").value.trim();
        if (mudarEstado(enc, novo, nota)) {
          RJSA.aviso("Estado atualizado para " + novo + ".");
          desenhar();
        }
      }
      if (ev.target.closest("[data-guardar-notas]")) {
        enc.notas = document.getElementById("notas").value.trim();
        RJSA.db.guardar();
        RJSA.aviso("Notas guardadas.");
      }
      if (ev.target.closest("[data-copiar]")) {
        var texto = textoFornecedor();
        (navigator.clipboard ? navigator.clipboard.writeText(texto) : Promise.reject())
          .then(function () { RJSA.aviso("Pedido copiado. Cole-o na conversa com o fornecedor."); })
          .catch(function () { window.prompt("Copie o texto:", texto); });
      }
      if (ev.target.closest("[data-apagar]")) {
        RJSA.confirmar({ titulo: "Apagar encomenda", texto: "Apagar a encomenda " + enc.numero + "? Deixa de contar nos relatórios e no financeiro. Para guardar o registo, mude o estado para Cancelada.", botao: "Apagar", perigo: true })
          .then(function (sim) {
            if (!sim) return;
            db.encomendas = db.encomendas.filter(function (x) { return x !== enc; });
            RJSA.db.guardar().then(function (ok) {
              if (!ok) return;
              RJSA.flash("Encomenda apagada.");
              location.href = "encomendas.html";
            });
          });
      }
    });

    conteudo.addEventListener("change", function (ev) {
      if (ev.target.id === "taxa") {
        enc.taxaEntrega = ev.target.value === "" ? null : Number(ev.target.value);
        RJSA.db.guardar();
        RJSA.aviso("Taxa de entrega guardada.");
        desenhar();
      }
      if (ev.target.id === "pedido-fornecedor") {
        enc.pedidoFornecedor = ev.target.checked;
        RJSA.db.guardar();
        RJSA.aviso(ev.target.checked ? "Marcado: pedido feito ao fornecedor." : "Marcado: pedido ainda por fazer.");
      }
    });

    desenhar();
  }
})();
