/* ==========================================================
   RJ SPORTS — Admin: produtos
   - produtos.html            → lista com pesquisa e filtros
   - adicionar-produto.html   → formulário novo
   - editar-produto.html?id=  → formulário de edição
   ========================================================== */

(function () {
  var pagina = document.body.getAttribute("data-pagina");
  var e = RJSA.e;
  var ic = RJSA.icones;

  if (pagina === "produtos") lista();
  else formulario(pagina === "editar-produto");

  function nomeCategoria(db, id) {
    var c = db.categorias.filter(function (x) { return x.id === id; })[0];
    return c ? c.nome : "—";
  }

  function margem(p) {
    if (!p.custo || !p.preco) return null;
    return Math.round(((p.preco - p.custo) / p.preco) * 100);
  }

  /* ==========================================================
     LISTA
     ========================================================== */
  function lista() {
    var conteudo = RJSA.montar({
      pagina: "produtos",
      titulo: "Produtos",
      acoes: '<a class="btn-adm btn-adm--primario" href="adicionar-produto.html">' + ic.mais + " Adicionar produto</a>"
    });
    if (!conteudo) return;
    var db = RJSA.db.obter();
    var filtro = { q: "", categoria: "", estado: RJSA.parametro("estado") || "" };

    function filtrados() {
      var t = RJSA.slug(filtro.q);
      return db.produtos.filter(function (p) {
        if (t && RJSA.slug(p.nome + " " + (p.sku || "")).indexOf(t) === -1) return false;
        if (filtro.categoria && p.categoria !== filtro.categoria) return false;
        if (filtro.estado === "ativos" && p.ativo === false) return false;
        if (filtro.estado === "inativos" && p.ativo !== false) return false;
        if (filtro.estado === "stock" && Number(p.stock) > 3) return false;
        return true;
      });
    }

    function linha(p) {
      var m = margem(p);
      var stock = Number(p.stock);
      return "<tr>" +
        '<td><div class="produto-celula">' + RJSA.miniatura(p) +
        '<div><strong><a href="editar-produto.html?id=' + encodeURIComponent(p.id) + '">' + e(p.nome) + "</a></strong><small>" + e(p.sku || "") + "</small></div></div></td>" +
        "<td>" + e(nomeCategoria(db, p.categoria)) + "</td>" +
        '<td class="num">' + RJSA.preco(p.preco) +
        (p.precoAntigo ? '<br><small style="text-decoration:line-through;color:var(--admin-texto-suave)">' + RJSA.preco(p.precoAntigo) + "</small>" : "") + "</td>" +
        '<td class="num">' + (p.custo ? RJSA.preco(p.custo) + "<br><small>" + m + "% margem</small>" : "—") + "</td>" +
        '<td class="num"><span class="' + (stock === 0 ? "stock-zero" : stock <= 3 ? "stock-baixo" : "") + '">' + (isNaN(stock) ? "—" : stock) + "</span></td>" +
        "<td>" + (p.ativo === false ? '<span class="estado estado--inativo">Oculto</span>' : '<span class="estado estado--ativo">Visível</span>') + "</td>" +
        '<td class="acoes">' +
        '<a class="btn-icone" href="../produto.html?id=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener" aria-label="Ver na loja" title="Ver na loja">' + ic.ver + "</a>" +
        '<a class="btn-icone" href="editar-produto.html?id=' + encodeURIComponent(p.id) + '" aria-label="Editar" title="Editar">' + ic.editar + "</a>" +
        '<button class="btn-icone" data-duplicar="' + e(p.id) + '" aria-label="Duplicar" title="Duplicar">' + ic.duplicar + "</button>" +
        '<button class="btn-icone btn-icone--perigo" data-apagar="' + e(p.id) + '" aria-label="Apagar" title="Apagar">' + ic.apagar + "</button>" +
        "</td></tr>";
    }

    function desenhar() {
      var itens = filtrados();
      conteudo.querySelector("tbody").innerHTML = itens.length
        ? itens.map(linha).join("")
        : '<tr><td colspan="7" class="vazio-tabela">Nenhum produto encontrado.</td></tr>';
      conteudo.querySelector("[data-contagem]").textContent =
        itens.length + " de " + db.produtos.length + " produtos";
    }

    conteudo.innerHTML =
      '<div class="ferramentas">' +
      '<label class="ferramentas__pesquisa">' + ic.pesquisa + '<input type="search" placeholder="Pesquisar por nome ou SKU" data-filtro="q"></label>' +
      '<select data-filtro="categoria" aria-label="Categoria"><option value="">Todas as categorias</option>' +
      db.categorias.map(function (c) { return '<option value="' + e(c.id) + '">' + e(c.nome) + "</option>"; }).join("") + "</select>" +
      '<select data-filtro="estado" aria-label="Estado"><option value="">Todos</option><option value="ativos">Visíveis na loja</option><option value="inativos">Ocultos</option><option value="stock">Stock baixo (≤ 3)</option></select>' +
      '<div class="ferramentas__direita"><button class="btn-adm" data-exportar>' + ic.descarregar + " Exportar CSV</button></div>" +
      "</div>" +
      '<div class="cartao"><div class="tabela-caixa"><table class="tabela"><thead><tr>' +
      '<th>Produto</th><th>Categoria</th><th class="num">Preço</th><th class="num">Custo</th><th class="num">Stock</th><th>Loja</th><th class="acoes"></th>' +
      "</tr></thead><tbody></tbody></table></div>" +
      '<div class="paginacao"><span data-contagem></span><span>Produtos ocultos não aparecem na loja.</span></div></div>';

    conteudo.querySelector('[data-filtro="estado"]').value = filtro.estado;

    conteudo.addEventListener("input", function (ev) {
      var f = ev.target.getAttribute("data-filtro");
      if (f) {
        filtro[f] = ev.target.value;
        desenhar();
      }
    });

    conteudo.addEventListener("click", function (ev) {
      var dup = ev.target.closest("[data-duplicar]");
      if (dup) {
        var original = db.produtos.filter(function (x) { return x.id === dup.getAttribute("data-duplicar"); })[0];
        var copia = JSON.parse(JSON.stringify(original));
        copia.nome = original.nome + " (cópia)";
        copia.id = idUnico(db, RJSA.slug(copia.nome));
        copia.sku = (original.sku || "") + "-C";
        copia.ativo = false;
        db.produtos.push(copia);
        RJSA.db.guardar();
        RJSA.aviso("Produto duplicado (fica oculto até o rever).");
        desenhar();
        return;
      }
      var ap = ev.target.closest("[data-apagar]");
      if (ap) {
        var p = db.produtos.filter(function (x) { return x.id === ap.getAttribute("data-apagar"); })[0];
        RJSA.confirmar({
          titulo: "Apagar produto",
          texto: "Apagar \"" + p.nome + "\"? As encomendas antigas continuam a mostrar este produto. Se só quer escondê-lo da loja, edite-o e desligue \"Visível na loja\".",
          botao: "Apagar",
          perigo: true
        }).then(function (sim) {
          if (!sim) return;
          db.produtos = db.produtos.filter(function (x) { return x !== p; });
          RJSA.db.guardar();
          RJSA.aviso("Produto apagado.");
          desenhar();
        });
        return;
      }
      if (ev.target.closest("[data-exportar]")) {
        RJSA.csv(
          ["SKU", "Nome", "Categoria", "Preço (MT)", "Preço antigo (MT)", "Custo (MT)", "Margem %", "Stock", "Visível"],
          filtrados().map(function (p) {
            return [p.sku, p.nome, nomeCategoria(db, p.categoria), p.preco, p.precoAntigo || "", p.custo || "", margem(p) == null ? "" : margem(p), p.stock, p.ativo === false ? "Não" : "Sim"];
          }),
          "produtos-rj-sports.csv"
        );
      }
    });

    desenhar();
  }

  function idUnico(db, base) {
    var id = base || "produto";
    var n = 2;
    while (db.produtos.some(function (x) { return x.id === id; })) id = base + "-" + n++;
    return id;
  }

  /* ==========================================================
     FORMULÁRIO (adicionar / editar)
     ========================================================== */
  function formulario(editar) {
    var conteudo = RJSA.montar({
      pagina: "produtos",
      titulo: editar ? "Editar produto" : "Adicionar produto",
      acoes: '<a class="btn-adm" href="produtos.html">' + ic.voltar + " Produtos</a>"
    });
    if (!conteudo) return;
    var db = RJSA.db.obter();

    var produto = null;
    if (editar) {
      var id = RJSA.parametro("id");
      produto = db.produtos.filter(function (x) { return x.id === id; })[0];
      if (!produto) {
        conteudo.innerHTML = '<div class="cartao"><div class="vazio-tabela">Produto não encontrado. <a class="ligacao" href="produtos.html">Voltar à lista</a></div></div>';
        return;
      }
    }
    var p = produto || { ativo: true, publico: [], idades: [], tamanhos: [], stock: 0 };
    var tamanhos = (p.tamanhos || []).slice();
    var imagem = p.imagem || "";

    var PRESETS = {
      "Roupa (XS–XXL)": ["XS", "S", "M", "L", "XL", "XXL"],
      "Calçado adulto (38–44)": ["38", "39", "40", "41", "42", "43", "44"],
      "Criança por idade (4A–12A)": ["4A", "6A", "8A", "10A", "12A"],
      "Calçado criança (28–35)": ["28", "29", "30", "31", "32", "33", "34", "35"]
    };

    function chips(nome, lista, marcados) {
      return '<div class="opcoes-chips">' + lista.map(function (o) {
        return '<label><input type="checkbox" name="' + nome + '" value="' + e(o.id) + '"' + (marcados.indexOf(o.id) > -1 ? " checked" : "") +
          "><span>" + e(o.nome) + "</span></label>";
      }).join("") + "</div>";
    }

    function interruptor(nome, texto, ligado, ajuda) {
      return '<label class="interruptor"><input type="checkbox" name="' + nome + '"' + (ligado ? " checked" : "") +
        '><span class="interruptor__trilho"></span><span>' + texto + (ajuda ? '<br><small style="color:var(--admin-texto-suave);font-weight:400">' + ajuda + "</small>" : "") + "</span></label>";
    }

    conteudo.innerHTML =
      '<form class="form-admin" id="form-produto" novalidate>' +
      '<div class="grelha-admin grelha-admin--2" style="align-items:start">' +

      // coluna principal
      '<div class="grelha-admin">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Informação</h2></div><div class="cartao__corpo"><div class="grelha-campos">' +
      '<div class="campo campo--inteiro" data-campo="nome"><label for="f-nome">Nome do produto</label><input id="f-nome" name="nome" value="' + e(p.nome || "") + '"><span class="campo__erro">Escreva o nome do produto.</span></div>' +
      '<div class="campo" data-campo="categoria"><label for="f-categoria">Categoria</label><select id="f-categoria" name="categoria"><option value="">Escolha…</option>' +
      db.categorias.map(function (c) { return '<option value="' + e(c.id) + '"' + (c.id === p.categoria ? " selected" : "") + ">" + e(c.nome) + "</option>"; }).join("") +
      '</select><span class="campo__erro">Escolha a categoria.</span></div>' +
      '<div class="campo"><label for="f-sku">SKU / referência</label><input id="f-sku" name="sku" value="' + e(p.sku || "") + '" placeholder="Ex.: RJS-014"></div>' +
      '<div class="campo campo--inteiro"><label for="f-descricao">Descrição</label><textarea id="f-descricao" name="descricao" placeholder="Materiais, utilização, detalhes que ajudam o cliente a decidir…">' + e(p.descricao || "") + "</textarea></div>" +
      "</div></div></section>" +

      '<section class="cartao"><div class="cartao__topo"><h2>Preço e margem</h2></div><div class="cartao__corpo"><div class="grelha-campos grelha-campos--3">' +
      '<div class="campo" data-campo="preco"><label for="f-preco">Preço de venda</label><div class="campo-prefixo"><input id="f-preco" name="preco" type="number" min="0" step="10" value="' + (p.preco || "") + '"><span>MT</span></div><span class="campo__erro">Indique o preço.</span></div>' +
      '<div class="campo" data-campo="precoAntigo"><label for="f-antigo">Preço antigo</label><div class="campo-prefixo"><input id="f-antigo" name="precoAntigo" type="number" min="0" step="10" value="' + (p.precoAntigo || "") + '"><span>MT</span></div><span class="campo__ajuda">Aparece riscado (promoção).</span><span class="campo__erro">Tem de ser maior que o preço de venda.</span></div>' +
      '<div class="campo"><label for="f-custo">Custo (fornecedor)</label><div class="campo-prefixo"><input id="f-custo" name="custo" type="number" min="0" step="10" value="' + (p.custo || "") + '"><span>MT</span></div><span class="campo__ajuda">Não aparece na loja.</span></div>' +
      '</div><div class="margem" style="margin-top:16px" id="margem"></div></div></section>' +

      '<section class="cartao"><div class="cartao__topo"><h2>Tamanhos e stock</h2></div><div class="cartao__corpo"><div class="grelha-campos">' +
      '<div class="campo campo--inteiro"><label for="f-tamanho">Tamanhos</label>' +
      '<div class="etiquetas-input" id="etiquetas"><input id="f-tamanho" placeholder="Escreva e carregue Enter (vazio = sem tamanho)"></div>' +
      '<div class="opcoes-chips" style="margin-top:8px">' + Object.keys(PRESETS).map(function (k) {
        return '<button type="button" class="btn-adm" data-preset="' + e(k) + '" style="min-height:30px;font-size:.75rem">' + e(k) + "</button>";
      }).join("") + "</div></div>" +
      '<div class="campo"><label for="f-stock">Stock disponível</label><input id="f-stock" name="stock" type="number" min="0" step="1" value="' + (p.stock == null ? "" : p.stock) + '"><span class="campo__ajuda">Em dropshipping, a quantidade que o fornecedor tem.</span></div>' +
      '<div class="campo"><label for="f-fornecedor">Fornecedor</label><select id="f-fornecedor" name="fornecedorId"><option value="">Sem fornecedor</option>' +
      db.fornecedores.map(function (f) { return '<option value="' + e(f.id) + '"' + (f.id === p.fornecedorId ? " selected" : "") + ">" + e(f.nome) + "</option>"; }).join("") +
      "</select></div>" +
      "</div></div></section>" +
      "</div>" +

      // coluna lateral
      '<div class="grelha-admin">' +
      '<section class="cartao"><div class="cartao__topo"><h2>Visibilidade</h2></div><div class="cartao__corpo interruptores">' +
      interruptor("ativo", "Visível na loja", p.ativo !== false) +
      interruptor("destaque", "Destaque", p.destaque, "Aparece em “Destaques” na página inicial") +
      interruptor("novo", "Novidade", p.novo, "Mostra a etiqueta “Novo”") +
      "</div></section>" +

      '<section class="cartao"><div class="cartao__topo"><h2>Imagem</h2></div><div class="cartao__corpo">' +
      '<div class="imagem-produto"><div class="imagem-produto__previa" id="previa">Sem imagem</div><div class="grelha-admin" style="gap:10px">' +
      '<label class="btn-adm" style="cursor:pointer">' + ic.carregar + ' Carregar foto<input type="file" accept="image/*" id="f-ficheiro" hidden></label>' +
      '<div class="campo"><label for="f-imagem">ou endereço (URL)</label><input id="f-imagem" value="' + e(/^data:/.test(imagem) ? "" : imagem) + '" placeholder="https://…"></div>' +
      '<button type="button" class="btn-adm btn-adm--perigo" data-remover-imagem>Remover imagem</button>' +
      "</div></div>" +
      '<p class="campo__ajuda" style="margin:12px 0 0">A foto carregada é reduzida para no máximo 1000 px e guardada neste navegador.</p>' +
      "</div></section>" +

      '<section class="cartao"><div class="cartao__topo"><h2>Para quem</h2></div><div class="cartao__corpo grelha-admin" style="gap:14px">' +
      chips("publico", RJS.publicos, p.publico || []) +
      '<div id="bloco-idades"><div class="campo__ajuda" style="margin-bottom:8px">Idades (só para criança)</div>' + chips("idades", RJS.idades, p.idades || []) + "</div>" +
      "</div></section>" +
      "</div>" +
      "</div>" +

      '<div class="cartao form-admin__rodape">' +
      (editar ? '<button type="button" class="btn-adm btn-adm--perigo" data-apagar style="margin-right:auto">' + ic.apagar + " Apagar</button>" : "") +
      '<a class="btn-adm" href="produtos.html">Cancelar</a>' +
      '<button type="submit" class="btn-adm btn-adm--primario">' + (editar ? "Guardar alterações" : "Adicionar produto") + "</button>" +
      "</div>" +
      "</form>";

    var form = document.getElementById("form-produto");

    /* --- margem em tempo real --- */
    function atualizarMargem() {
      var preco = Number(form.preco.value) || 0;
      var custo = Number(form.custo.value) || 0;
      var lucro = preco - custo;
      var pct = preco && custo ? Math.round((lucro / preco) * 100) : null;
      document.getElementById("margem").innerHTML =
        "<div><span>Lucro por unidade</span><strong>" + (custo ? RJSA.preco(lucro) : "—") + "</strong></div>" +
        "<div><span>Margem</span><strong>" + (pct == null ? "—" : pct + "%") + "</strong></div>" +
        "<div><span>Desconto mostrado</span><strong>" +
        (Number(form.precoAntigo.value) > preco && preco ? "-" + Math.round((1 - preco / Number(form.precoAntigo.value)) * 100) + "%" : "—") + "</strong></div>";
    }

    /* --- tamanhos --- */
    var caixaEtq = document.getElementById("etiquetas");
    var campoTam = document.getElementById("f-tamanho");
    function desenharTamanhos() {
      caixaEtq.querySelectorAll(".etq").forEach(function (x) { x.remove(); });
      tamanhos.forEach(function (t) {
        var span = document.createElement("span");
        span.className = "etq";
        span.innerHTML = e(t) + '<button type="button" aria-label="Remover ' + e(t) + '" data-tirar="' + e(t) + '">×</button>';
        caixaEtq.insertBefore(span, campoTam);
      });
    }
    function juntarTamanho(valor) {
      valor.split(/[,;\s]+/).forEach(function (t) {
        t = t.trim().toUpperCase();
        if (t && tamanhos.indexOf(t) === -1) tamanhos.push(t);
      });
      desenharTamanhos();
    }
    campoTam.addEventListener("keydown", function (ev) {
      if ((ev.key === "Enter" || ev.key === ",") && campoTam.value.trim()) {
        ev.preventDefault();
        juntarTamanho(campoTam.value);
        campoTam.value = "";
      } else if (ev.key === "Backspace" && !campoTam.value && tamanhos.length) {
        tamanhos.pop();
        desenharTamanhos();
      }
    });
    campoTam.addEventListener("blur", function () {
      if (campoTam.value.trim()) {
        juntarTamanho(campoTam.value);
        campoTam.value = "";
      }
    });
    caixaEtq.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-tirar]");
      if (b) {
        tamanhos = tamanhos.filter(function (t) { return t !== b.getAttribute("data-tirar"); });
        desenharTamanhos();
      } else {
        campoTam.focus();
      }
    });

    /* --- imagem --- */
    function desenharImagem() {
      var previa = document.getElementById("previa");
      previa.innerHTML = imagem ? '<img src="' + e(RJSA.img(imagem)) + '" alt="" onerror="this.remove()">' : "Sem imagem";
    }
    document.getElementById("f-imagem").addEventListener("change", function (ev) {
      imagem = ev.target.value.trim();
      desenharImagem();
    });
    document.getElementById("f-ficheiro").addEventListener("change", function (ev) {
      var ficheiro = ev.target.files[0];
      if (!ficheiro) return;
      var leitor = new FileReader();
      leitor.onload = function () {
        var img = new Image();
        img.onload = function () {
          var escala = Math.min(1, 1000 / Math.max(img.width, img.height));
          var tela = document.createElement("canvas");
          tela.width = Math.round(img.width * escala);
          tela.height = Math.round(img.height * escala);
          tela.getContext("2d").drawImage(img, 0, 0, tela.width, tela.height);
          document.getElementById("f-imagem").value = "";

          if (!RJSA.modoApi) {
            // sem servidor: a foto fica guardada no próprio produto (neste navegador)
            imagem = tela.toDataURL("image/jpeg", 0.82);
            desenharImagem();
            RJSA.aviso("Foto carregada. Não se esqueça de guardar.");
            return;
          }

          // com servidor: a foto é enviada e fica em /uploads
          RJSA.aviso("A enviar a foto…");
          tela.toBlob(function (blob) {
            var dados = new FormData();
            dados.append("foto", blob, "foto.jpg");
            fetch("/api/admin/uploads", { method: "POST", body: dados, credentials: "same-origin" })
              .then(function (r) {
                return r.json().then(function (j) {
                  if (!r.ok) throw new Error(j.erro || "Falhou o envio.");
                  return j;
                });
              })
              .then(function (j) {
                imagem = j.url;
                desenharImagem();
                RJSA.aviso("Foto enviada. Não se esqueça de guardar.");
              })
              .catch(function (erro) {
                RJSA.aviso("Não foi possível enviar a foto: " + erro.message, "erro");
              });
          }, "image/jpeg", 0.85);
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(ficheiro);
    });

    /* --- idades só para criança --- */
    function atualizarIdades() {
      var crianca = form.querySelector('input[name="publico"][value="crianca"]').checked;
      document.getElementById("bloco-idades").style.opacity = crianca ? "1" : "0.45";
      form.querySelectorAll('input[name="idades"]').forEach(function (i) { i.disabled = !crianca; });
    }

    form.addEventListener("input", function (ev) {
      if (["preco", "custo", "precoAntigo"].indexOf(ev.target.name) > -1) atualizarMargem();
      if (ev.target.name === "publico") atualizarIdades();
      var b = ev.target.closest(".campo.invalido");
      if (b) b.classList.remove("invalido");
    });

    form.addEventListener("click", function (ev) {
      var pr = ev.target.closest("[data-preset]");
      if (pr) {
        tamanhos = PRESETS[pr.getAttribute("data-preset")].slice();
        desenharTamanhos();
      }
      if (ev.target.closest("[data-remover-imagem]")) {
        imagem = "";
        document.getElementById("f-imagem").value = "";
        desenharImagem();
      }
      if (ev.target.closest("[data-apagar]")) {
        RJSA.confirmar({ titulo: "Apagar produto", texto: "Apagar \"" + p.nome + "\"? Esta ação não pode ser desfeita.", botao: "Apagar", perigo: true })
          .then(function (sim) {
            if (!sim) return;
            db.produtos = db.produtos.filter(function (x) { return x !== produto; });
            RJSA.db.guardar().then(function (ok) {
              if (!ok) return;
              RJSA.flash("Produto apagado.");
              location.href = "produtos.html";
            });
          });
      }
    });

    /* --- guardar --- */
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var marcados = function (nome) {
        return Array.prototype.map.call(form.querySelectorAll('input[name="' + nome + '"]:checked'), function (i) { return i.value; });
      };
      var preco = Number(form.preco.value);
      var antigo = form.precoAntigo.value === "" ? null : Number(form.precoAntigo.value);

      var erros = [];
      if (!form.nome.value.trim()) erros.push("nome");
      if (!form.categoria.value) erros.push("categoria");
      if (!preco || preco <= 0) erros.push("preco");
      if (antigo !== null && antigo <= preco) erros.push("precoAntigo");
      form.querySelectorAll(".campo.invalido").forEach(function (c) { c.classList.remove("invalido"); });
      if (erros.length) {
        erros.forEach(function (c) { form.querySelector('[data-campo="' + c + '"]').classList.add("invalido"); });
        form.querySelector('[data-campo="' + erros[0] + '"]').scrollIntoView({ behavior: "smooth", block: "center" });
        RJSA.aviso("Corrija os campos assinalados.", "erro");
        return;
      }

      if (campoTam.value.trim()) juntarTamanho(campoTam.value);
      var publico = marcados("publico");

      var dados = {
        nome: form.nome.value.trim(),
        categoria: form.categoria.value,
        sku: form.sku.value.trim(),
        descricao: form.descricao.value.trim(),
        preco: preco,
        precoAntigo: antigo || undefined,
        custo: form.custo.value === "" ? null : Number(form.custo.value),
        stock: form.stock.value === "" ? 0 : Number(form.stock.value),
        fornecedorId: form.fornecedorId.value,
        tamanhos: tamanhos.slice(),
        publico: publico,
        idades: publico.indexOf("crianca") > -1 ? marcados("idades") : [],
        imagem: imagem,
        ativo: form.ativo.checked,
        destaque: form.destaque.checked,
        novo: form.novo.checked
      };

      if (produto) {
        Object.assign(produto, dados);
        if (!dados.precoAntigo) delete produto.precoAntigo;
      } else {
        dados.id = idUnico(db, RJSA.slug(dados.nome));
        if (!dados.sku) dados.sku = "RJS-" + String(db.produtos.length + 1).padStart(3, "0");
        db.produtos.push(dados);
      }
      var botaoGuardar = form.querySelector('button[type="submit"]');
      botaoGuardar.disabled = true;
      RJSA.db.guardar().then(function (ok) {
        botaoGuardar.disabled = false;
        if (!ok) return;
        RJSA.flash(produto ? "Alterações guardadas." : "Produto adicionado.");
        location.href = "produtos.html";
      });
    });

    desenharTamanhos();
    desenharImagem();
    atualizarMargem();
    atualizarIdades();
  }
})();
