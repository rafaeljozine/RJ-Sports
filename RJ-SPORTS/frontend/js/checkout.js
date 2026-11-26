/* ==========================================================
   RJ SPORTS — Checkout (formulário de encomenda)
   Fase 1: sem pagamento online. O cliente preenche os dados,
   a encomenda fica registada no navegador e é enviada à loja
   pelo WhatsApp. Quando houver backend, o envio passa a ser
   feito para a API (POST /api/encomendas) em enviarEncomenda().
   ========================================================== */

(function () {
  var alvo = document.getElementById("checkout");
  if (!alvo) return;

  var e = RJS.escapar;
  var ic = RJS.iconesCompra;

  var PROVINCIAS = [
    "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica",
    "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"
  ];

  var PAGAMENTOS = [
    { id: "numerario", nome: "Numerário", texto: "Dinheiro na entrega" },
    { id: "mpesa", nome: "M-Pesa", texto: "Transferência na entrega" },
    { id: "emola", nome: "e-Mola", texto: "Transferência na entrega" }
  ];

  /* ---------- Armazenamento local ---------- */
  function lerJson(chave, padrao) {
    try {
      return JSON.parse(localStorage.getItem(chave)) || padrao;
    } catch (err) {
      return padrao;
    }
  }

  function guardarJson(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (err) {
      /* sem armazenamento: continua sem guardar */
    }
  }

  /* ---------- Telefone de Moçambique ---------- */
  /** Devolve só os 9 dígitos (ex.: 841234567) ou "" se for inválido */
  function normalizarTelefone(valor) {
    var digitos = String(valor || "").replace(/\D/g, "");
    if (digitos.indexOf("258") === 0 && digitos.length === 12) digitos = digitos.slice(3);
    return /^8[2-7]\d{7}$/.test(digitos) ? digitos : "";
  }

  function formatarTelefone(nove) {
    return "+258 " + nove.slice(0, 2) + " " + nove.slice(2, 5) + " " + nove.slice(5);
  }

  /* ---------- Número de encomenda ---------- */
  function gerarNumero() {
    var n;
    if (window.crypto && crypto.getRandomValues) {
      n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
    } else {
      n = Math.floor(Math.random() * 1000000);
    }
    return "RJS-" + String(n).padStart(6, "0");
  }

  /* ---------- Resumo lateral ---------- */
  function htmlResumo(linhas, total) {
    var artigos = linhas.map(function (l) {
      var p = l.produto;
      return (
        '<div class="resumo__artigo">' +
        '  <div class="resumo__artigo-media">' +
        '    <span class="resumo__artigo-qtd">' + l.quantidade + "</span>" +
        '    <img src="' + e(p.imagem) + '" alt="" onerror="this.remove()">' +
        "  </div>" +
        "  <div>" +
        '    <div class="resumo__artigo-nome">' + e(p.nome) + "</div>" +
        (l.tamanho ? '<div class="resumo__artigo-tamanho">Tamanho: ' + e(l.tamanho) + "</div>" : "") +
        "  </div>" +
        '  <div class="resumo__artigo-preco">' + RJS.formatarPreco(l.subtotal) + "</div>" +
        "</div>"
      );
    }).join("");

    return (
      '<aside class="resumo" aria-label="Resumo da encomenda">' +
      "  <h2>A sua encomenda</h2>" +
      '  <div class="resumo__artigos">' + artigos + "</div>" +
      '  <div class="resumo__linha"><span>Subtotal</span><span>' + RJS.formatarPreco(total) + "</span></div>" +
      '  <div class="resumo__linha"><span>Entrega</span><span>Confirmada por telefone</span></div>' +
      '  <div class="resumo__linha resumo__linha--total"><span>Total a pagar na entrega</span><span>' + RJS.formatarPreco(total) + "</span></div>" +
      '  <a class="resumo__editar" href="carrinho.html">Editar carrinho</a>' +
      "</aside>"
    );
  }

  /* ---------- Formulário ---------- */
  function campo(id, rotulo, tipo, opcoes) {
    opcoes = opcoes || {};
    var obrigatorio = !opcoes.opcional;
    var valor = e(opcoes.valor || "");
    var atributos = ' id="' + id + '" name="' + id + '"' + (obrigatorio ? " required" : "") +
      (opcoes.autocomplete ? ' autocomplete="' + opcoes.autocomplete + '"' : "") +
      (opcoes.placeholder ? ' placeholder="' + e(opcoes.placeholder) + '"' : "");

    var controlo;
    if (tipo === "textarea") {
      controlo = "<textarea" + atributos + ">" + valor + "</textarea>";
    } else if (tipo === "select") {
      controlo = "<select" + atributos + '><option value="">Escolha…</option>' +
        opcoes.lista.map(function (o) {
          return "<option" + (o === opcoes.valor ? " selected" : "") + ">" + e(o) + "</option>";
        }).join("") + "</select>";
    } else if (tipo === "tel") {
      controlo = '<div class="campo-telefone"><span>+258</span><input type="tel" inputmode="tel" maxlength="13"' +
        atributos + ' value="' + valor + '"></div>';
    } else {
      controlo = '<input type="' + tipo + '"' + atributos + ' value="' + valor + '">';
    }

    return (
      '<div class="campo' + (opcoes.inteiro ? " campo--inteiro" : "") + '" data-campo="' + id + '">' +
      '  <label for="' + id + '">' + rotulo + (obrigatorio ? "" : ' <span class="opcional">(opcional)</span>') + "</label>" +
      controlo +
      (opcoes.ajuda ? '<span class="campo__ajuda">' + opcoes.ajuda + "</span>" : "") +
      '<span class="campo__erro">' + (opcoes.erro || "Preencha este campo.") + "</span>" +
      "</div>"
    );
  }

  function desenharFormulario() {
    var linhas = RJS.carrinho.linhas();

    if (!linhas.length) {
      alvo.innerHTML =
        '<div class="carrinho-vazio">' + ic.saco +
        "<h2>Não há nada para encomendar</h2>" +
        "<p>O seu carrinho está vazio. Adicione produtos para finalizar a encomenda.</p>" +
        '<a class="btn btn--destaque" href="loja.html">Ir para a loja</a></div>';
      return;
    }

    var total = RJS.carrinho.total();
    var c = rascunho || lerJson("rjs_cliente", {});
    var pagamentoGuardado = c.pagamento || "numerario";

    alvo.innerHTML =
      "<h1>Finalizar encomenda</h1>" +
      '<p class="checkout__intro">Preencha os seus dados. Ligamos para confirmar a encomenda e a taxa de entrega — só paga quando receber.</p>' +
      '<div class="checkout">' +
      '  <form id="form-encomenda" novalidate>' +

      '    <section class="etapa">' +
      '      <h2 class="etapa__titulo"><span class="etapa__numero">1</span> Contacto</h2>' +
      '      <div class="grelha-campos">' +
      campo("nome", "Nome completo", "text", { valor: c.nome, autocomplete: "name", inteiro: true, erro: "Escreva o seu nome completo." }) +
      campo("telefone", "Telefone", "tel", {
        valor: c.telefone, autocomplete: "tel-national", placeholder: "84 123 4567",
        ajuda: "Vamos ligar para este número para confirmar.", erro: "Número inválido. Ex.: 84 123 4567"
      }) +
      campo("telefone2", "Outro contacto / WhatsApp", "tel", {
        valor: c.telefone2, opcional: true, placeholder: "86 123 4567", erro: "Número inválido. Ex.: 86 123 4567"
      }) +
      "      </div>" +
      "    </section>" +

      '    <section class="etapa">' +
      '      <h2 class="etapa__titulo"><span class="etapa__numero">2</span> Morada de entrega</h2>' +
      '      <div class="grelha-campos">' +
      campo("provincia", "Província", "select", { lista: PROVINCIAS, valor: c.provincia, erro: "Escolha a província." }) +
      campo("cidade", "Cidade / Distrito", "text", { valor: c.cidade, autocomplete: "address-level2", erro: "Indique a cidade ou distrito." }) +
      campo("bairro", "Bairro", "text", { valor: c.bairro, inteiro: true, erro: "Indique o bairro." }) +
      campo("endereco", "Rua, nº da casa e ponto de referência", "textarea", {
        valor: c.endereco, inteiro: true, autocomplete: "street-address",
        placeholder: "Ex.: Av. Eduardo Mondlane, casa 120, perto da escola primária",
        erro: "Indique a rua ou um ponto de referência."
      }) +
      campo("observacoes", "Observações", "textarea", {
        valor: c.observacoes, opcional: true, inteiro: true, placeholder: "Ex.: entregar depois das 17h"
      }) +
      "      </div>" +
      "    </section>" +

      '    <section class="etapa">' +
      '      <h2 class="etapa__titulo"><span class="etapa__numero">3</span> Pagamento na entrega</h2>' +
      '      <div class="opcoes-pagamento" role="radiogroup" aria-label="Forma de pagamento">' +
      PAGAMENTOS.map(function (p) {
        return '<label class="opcao-pagamento"><input type="radio" name="pagamento" value="' + p.id + '"' +
          (p.id === pagamentoGuardado ? " checked" : "") + "><span><strong>" + p.nome + "</strong>" + p.texto + "</span></label>";
      }).join("") +
      "      </div>" +
      '      <p class="pagamento__nota">Não paga nada agora. Escolha apenas como prefere pagar quando receber.</p>' +
      "    </section>" +

      '    <div class="checkout__enviar">' +
      '      <button type="submit" class="btn btn--destaque btn--bloco">Confirmar encomenda · ' + RJS.formatarPreco(total) + "</button>" +
      '      <p class="checkout__termos">Ao confirmar, a RJ Sports entra em contacto para validar a encomenda antes do envio.</p>' +
      "    </div>" +
      "  </form>" +
      htmlResumo(linhas, total) +
      "</div>";

    ligarFormulario();
  }

  /* ---------- Validação ---------- */
  function marcar(id, valido) {
    var el = alvo.querySelector('[data-campo="' + id + '"]');
    if (el) el.classList.toggle("invalido", !valido);
    return valido;
  }

  function valor(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function validar() {
    var ok = true;
    ok = marcar("nome", valor("nome").length >= 3 && /\s/.test(valor("nome"))) && ok;
    ok = marcar("telefone", !!normalizarTelefone(valor("telefone"))) && ok;
    ok = marcar("telefone2", !valor("telefone2") || !!normalizarTelefone(valor("telefone2"))) && ok;
    ok = marcar("provincia", !!valor("provincia")) && ok;
    ok = marcar("cidade", valor("cidade").length >= 2) && ok;
    ok = marcar("bairro", valor("bairro").length >= 2) && ok;
    ok = marcar("endereco", valor("endereco").length >= 5) && ok;
    return ok;
  }

  function ligarFormulario() {
    var form = document.getElementById("form-encomenda");

    // Retira o erro assim que o campo é corrigido
    form.addEventListener("input", function (ev) {
      var bloco = ev.target.closest(".campo.invalido");
      if (bloco) bloco.classList.remove("invalido");
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!validar()) {
        var primeiro = form.querySelector(".campo.invalido input, .campo.invalido select, .campo.invalido textarea");
        if (primeiro) {
          primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
          primeiro.focus({ preventScroll: true });
        }
        return;
      }
      enviarEncomenda();
    });
  }

  /* ---------- Envio ---------- */
  function enviarEncomenda() {
    var linhas = RJS.carrinho.linhas();
    var pagamentoId = (document.querySelector('input[name="pagamento"]:checked') || {}).value || "numerario";
    var pagamento = PAGAMENTOS.filter(function (p) { return p.id === pagamentoId; })[0];

    var cliente = {
      nome: valor("nome"),
      telefone: formatarTelefone(normalizarTelefone(valor("telefone"))),
      telefone2: valor("telefone2") ? formatarTelefone(normalizarTelefone(valor("telefone2"))) : "",
      provincia: valor("provincia"),
      cidade: valor("cidade"),
      bairro: valor("bairro"),
      endereco: valor("endereco"),
      observacoes: valor("observacoes")
    };

    var encomenda = {
      numero: gerarNumero(),
      data: new Date().toISOString(),
      estado: "Recebida",
      cliente: cliente,
      pagamento: pagamento.nome,
      itens: linhas.map(function (l) {
        return {
          id: l.produto.id,
          nome: l.produto.nome,
          tamanho: l.tamanho,
          quantidade: l.quantidade,
          preco: l.produto.preco,
          subtotal: l.subtotal
        };
      }),
      total: RJS.carrinho.total()
    };

    // Sem servidor: a encomenda fica só neste navegador (e segue pelo WhatsApp)
    if (!RJS.modoApi) {
      concluir(encomenda, linhas, cliente, pagamentoId);
      return;
    }

    // Com servidor: a encomenda é registada na base de dados.
    // O servidor recalcula os preços e devolve o número oficial.
    var botao = document.querySelector('#form-encomenda button[type="submit"]');
    var textoBotao = botao.textContent;
    botao.disabled = true;
    botao.textContent = "A registar a encomenda…";

    RJS.api("/encomendas", {
      metodo: "POST",
      corpo: {
        cliente: cliente,
        pagamento: pagamento.nome,
        itens: linhas.map(function (l) {
          return { id: l.produto.id, tamanho: l.tamanho || "", quantidade: l.quantidade };
        })
      }
    }).then(function (registada) {
      encomenda.numero = registada.numero;
      encomenda.data = registada.data;
      encomenda.total = registada.total;
      encomenda.cliente.telefone = registada.cliente.telefone;
      concluir(encomenda, linhas, cliente, pagamentoId);
    }).catch(function (erro) {
      botao.disabled = false;
      botao.textContent = textoBotao;
      RJS.aviso(erro.message);
    });
  }

  function concluir(encomenda, linhas, cliente, pagamentoId) {
    // Guarda a encomenda (usado mais tarde em "Acompanhar encomenda")
    var encomendas = lerJson("rjs_encomendas", []);
    encomendas.unshift(encomenda);
    guardarJson("rjs_encomendas", encomendas.slice(0, 20));

    // Guarda os dados do cliente para preencher na próxima vez
    guardarJson("rjs_cliente", {
      nome: cliente.nome,
      telefone: valor("telefone"),
      telefone2: valor("telefone2"),
      provincia: cliente.provincia,
      cidade: cliente.cidade,
      bairro: cliente.bairro,
      endereco: cliente.endereco,
      pagamento: pagamentoId
    });

    var mensagem = mensagemWhatsapp(encomenda, linhas);
    RJS.carrinho.limpar();
    desenharConfirmacao(encomenda, mensagem);
  }

  function mensagemWhatsapp(enc, linhas) {
    var c = enc.cliente;
    var partes = [
      "Olá RJ Sports! Fiz a encomenda " + enc.numero + ":",
      "",
      RJS.textoArtigos(linhas),
      "Total: " + RJS.formatarPreco(enc.total) + " (+ entrega)",
      "",
      "Nome: " + c.nome,
      "Telefone: " + c.telefone + (c.telefone2 ? " / " + c.telefone2 : ""),
      "Província: " + c.provincia,
      "Cidade/Distrito: " + c.cidade,
      "Bairro: " + c.bairro,
      "Morada: " + c.endereco,
      "Pagamento na entrega: " + enc.pagamento
    ];
    if (c.observacoes) partes.push("Observações: " + c.observacoes);
    return partes.join("\n");
  }

  /* ---------- Confirmação ---------- */
  function desenharConfirmacao(enc, mensagem) {
    var c = enc.cliente;
    var urlWhats = "https://wa.me/" + RJS.loja.whatsapp + "?text=" + encodeURIComponent(mensagem);

    alvo.innerHTML =
      '<div class="confirmacao">' +
      '  <div class="confirmacao__icone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 5 5L20 7"/></svg></div>' +
      "  <h1>Encomenda registada!</h1>" +
      '  <div class="confirmacao__numero">' + e(enc.numero) + "</div>" +
      "  <p>Obrigado, " + e(c.nome.split(" ")[0]) + ". Vamos ligar para o <strong>" + e(c.telefone) +
      "</strong> para confirmar a encomenda e a taxa de entrega.</p>" +
      '  <div class="confirmacao__aviso"><strong>Último passo: envie a encomenda pelo WhatsApp</strong>' +
      "    Assim recebemos já os seus dados e confirmamos mais depressa. A mensagem já vem escrita — só precisa de carregar em enviar.</div>" +
      '  <div class="confirmacao__botoes">' +
      '    <a class="btn btn--destaque btn--bloco" href="' + urlWhats + '" target="_blank" rel="noopener">' + ic.whatsapp + " Enviar pelo WhatsApp</a>" +
      '    <a class="btn btn--contorno btn--bloco" href="acompanhar.html?n=' + encodeURIComponent(enc.numero) + '">Acompanhar encomenda</a>' +
      '    <a class="link-sublinhado" style="justify-self:center;margin-top:8px" href="loja.html">Continuar a comprar</a>' +
      "  </div>" +
      '  <div class="confirmacao__dados">' +
      "    <h2>Resumo</h2>" +
      "    <dl>" +
      "      <dt>Artigos</dt><dd>" + enc.itens.map(function (i) {
        return e(i.quantidade + "x " + i.nome + (i.tamanho ? " (" + i.tamanho + ")" : ""));
      }).join("<br>") + "</dd>" +
      "      <dt>Total</dt><dd>" + RJS.formatarPreco(enc.total) + " + entrega</dd>" +
      "      <dt>Pagamento</dt><dd>" + e(enc.pagamento) + " na entrega</dd>" +
      "      <dt>Entrega</dt><dd>" + e(c.endereco) + ", " + e(c.bairro) + ", " + e(c.cidade) + " — " + e(c.provincia) + "</dd>" +
      "    </dl>" +
      "  </div>" +
      "</div>";

    document.title = "Encomenda " + enc.numero + " — RJ Sports";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* Volta a desenhar se o carrinho mudar noutro sítio (ex.: carrinho lateral) */
  var rascunho = null;
  document.addEventListener("carrinho:atualizado", function () {
    if (!document.getElementById("form-encomenda")) return;
    // guarda o que já foi escrito para não se perder ao redesenhar
    rascunho = {};
    ["nome", "telefone", "telefone2", "provincia", "cidade", "bairro", "endereco", "observacoes"].forEach(function (id) {
      rascunho[id] = valor(id);
    });
    rascunho.pagamento = (document.querySelector('input[name="pagamento"]:checked') || {}).value;
    desenharFormulario();
  });

  desenharFormulario();
})();
