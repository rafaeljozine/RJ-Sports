/* ==========================================================
   RJ SPORTS — Acompanhar encomenda
   Fase 1 (sem backend): procura a encomenda guardada neste
   navegador quando foi feita. Quando houver API, a função
   procurarEncomenda() passa a chamar
   GET /api/encomendas/:numero?telefone=...
   ========================================================== */

(function () {
  var form = document.getElementById("form-acompanhar");
  if (!form) return;

  var e = RJS.escapar;
  var ic = RJS.iconesCompra;
  var resultado = document.getElementById("resultado");

  var ESTADOS = [
    { nome: "Recebida", texto: "Registámos o seu pedido." },
    { nome: "Confirmada", texto: "Ligámos e confirmámos os dados." },
    { nome: "Enviada", texto: "A encomenda está a caminho." },
    { nome: "Entregue", texto: "Recebeu e pagou na entrega." }
  ];

  /* ---------- Utilitários ---------- */
  function lerEncomendas() {
    try {
      var lista = JSON.parse(localStorage.getItem("rjs_encomendas") || "[]");
      return Array.isArray(lista) ? lista : [];
    } catch (err) {
      return [];
    }
  }

  /** Aceita "RJS-123456", "rjs123456" ou "123456" e devolve "RJS-123456" */
  function normalizarNumero(valor) {
    var digitos = String(valor || "").replace(/\D/g, "");
    return digitos.length === 6 ? "RJS-" + digitos : "";
  }

  function normalizarTelefone(valor) {
    var digitos = String(valor || "").replace(/\D/g, "");
    if (digitos.indexOf("258") === 0 && digitos.length === 12) digitos = digitos.slice(3);
    return /^8[2-7]\d{7}$/.test(digitos) ? digitos : "";
  }

  function formatarData(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" }) +
      " às " + d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  }

  /** Procura a encomenda: no servidor (estado real) ou, sem servidor, neste navegador */
  function procurarEncomenda(numero, telefone) {
    if (RJS.modoApi) {
      return RJS.api("/encomendas/" + encodeURIComponent(numero) + "?telefone=" + encodeURIComponent(telefone), { protegido: true })
        .catch(function (erro) {
          if (erro.estado === 404) return null;
          throw erro;
        });
    }
    if (!RJS.modoDemo) {
      return Promise.reject(new Error("Não foi possível ligar à loja. Tente novamente daqui a pouco."));
    }
    return Promise.resolve(lerEncomendas().filter(function (enc) {
      return enc.numero === numero && normalizarTelefone(enc.cliente && enc.cliente.telefone) === telefone;
    })[0] || null);
  }

  /** Mostra a encomenda (ou "não encontrada") */
  function mostrar(numero, telefone) {
    resultado.setAttribute("aria-busy", "true");
    return procurarEncomenda(numero, telefone).then(function (enc) {
      if (enc) desenharEncomenda(enc);
      else desenharNaoEncontrada(numero);
      desenharRecentes(enc ? enc.numero : "");
      history.replaceState(null, "", location.pathname + "?n=" + encodeURIComponent(numero));
      return enc;
    }).catch(function (erro) {
      RJS.aviso(erro.message);
    }).finally(function () {
      resultado.removeAttribute("aria-busy");
    });
  }

  function linkWhatsapp(texto) {
    return "https://wa.me/" + RJS.loja.whatsapp + "?text=" + encodeURIComponent(texto);
  }

  /* ---------- Desenhar ---------- */
  function desenharInicial() {
    resultado.innerHTML =
      '<div class="resultado-vazio"><div>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/></svg>' +
      "<h2>Onde está a minha encomenda?</h2>" +
      "<p>Preencha o número e o telefone para ver em que fase está a sua encomenda.</p>" +
      "</div></div>";
  }

  function desenharNaoEncontrada(numero) {
    resultado.innerHTML =
      '<div class="resultado-vazio"><div>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8.5 8.5l5 5M13.5 8.5l-5 5"/></svg>' +
      "<h2>Encomenda não encontrada</h2>" +
      "<p>Confirme o número e o telefone. Se fez a encomenda noutro telemóvel ou computador, fale connosco que vemos o estado por si.</p>" +
      '<a class="btn btn--whatsapp" target="_blank" rel="noopener" href="' +
      linkWhatsapp("Olá RJ Sports! Quero saber o estado da minha encomenda " + numero + ".") + '">' +
      ic.whatsapp + " Perguntar pelo WhatsApp</a>" +
      "</div></div>";
  }

  function desenharEncomenda(enc) {
    var c = enc.cliente || {};
    var indice = Math.max(0, ESTADOS.map(function (s) { return s.nome; }).indexOf(enc.estado));

    var passos = ESTADOS.map(function (s, i) {
      var classe = i < indice ? " feito" : i === indice ? " atual" : "";
      return '<div class="passo-estado' + classe + '"' + (i === indice ? ' aria-current="step"' : "") + ">" +
        "<strong>" + s.nome + "</strong><span>" + s.texto + "</span></div>";
    }).join("");

    var artigos = (enc.itens || []).map(function (i) {
      return '<div class="resultado__artigo"><span>' + e(i.quantidade + "x " + i.nome + (i.tamanho ? " (" + i.tamanho + ")" : "")) +
        "</span><span>" + RJS.formatarPreco(i.subtotal) + "</span></div>";
    }).join("");

    resultado.innerHTML =
      '<article class="resultado">' +
      '  <div class="resultado__topo">' +
      "    <div><h2>" + e(enc.numero) + '</h2><div class="resultado__data">Feita a ' + formatarData(enc.data) + "</div></div>" +
      '    <span class="estado-etiqueta">' + e(ESTADOS[indice].nome) + "</span>" +
      "  </div>" +
      '  <div class="linha-tempo" role="list" aria-label="Estado da encomenda">' + passos + "</div>" +
      '  <div class="resultado__corpo">' +
      "    <div>" +
      "      <h3>Artigos</h3>" +
      '      <div class="resultado__artigos">' + artigos + "</div>" +
      (enc.desconto ? '      <div class="resultado__total resultado__total--desconto"><span>Desconto (' + e(enc.codigoDesconto || "código") + ")</span><span>− " + RJS.formatarPreco(enc.desconto) + "</span></div>" : "") +
      '      <div class="resultado__total"><span>Total (+ entrega)</span><span>' + RJS.formatarPreco(enc.total) + "</span></div>" +
      "    </div>" +
      "    <div>" +
      "      <h3>Entrega</h3>" +
      '      <p class="resultado__entrega">' + e(c.nome) + "<br>" + e(c.telefone) + "<br>" +
      e(c.endereco) + "<br>" + e(c.bairro) + ", " + e(c.cidade) + "<br>" + e(c.provincia) + "</p>" +
      "      <h3>Pagamento</h3>" +
      '      <p class="resultado__entrega">' + e(enc.pagamento) + " na entrega</p>" +
      "    </div>" +
      "  </div>" +
      '  <div class="resultado__rodape">' +
      "    <span>O estado é atualizado pela nossa equipa. Tem dúvidas?</span>" +
      '    <a class="btn btn--whatsapp" target="_blank" rel="noopener" href="' +
      linkWhatsapp("Olá RJ Sports! Quero saber o estado da minha encomenda " + enc.numero + ".") + '">' +
      ic.whatsapp + " Falar connosco</a>" +
      "  </div>" +
      "</article>";
  }

  function desenharRecentes(ativo) {
    var lista = lerEncomendas();
    var caixa = document.getElementById("recentes");
    if (!lista.length) {
      caixa.hidden = true;
      return;
    }
    caixa.hidden = false;
    document.getElementById("lista-recentes").innerHTML = lista.slice(0, 5).map(function (enc) {
      return '<button type="button" class="recente' + (enc.numero === ativo ? " ativo" : "") + '" data-numero="' + e(enc.numero) + '">' +
        "<div><strong>" + e(enc.numero) + "</strong><span>" + formatarData(enc.data) + "</span></div>" +
        "<span>" + RJS.formatarPreco(enc.total) + "</span></button>";
    }).join("");
  }

  /* ---------- Eventos ---------- */
  function marcar(id, valido) {
    form.querySelector('[data-campo="' + id + '"]').classList.toggle("invalido", !valido);
    return valido;
  }

  function pesquisar() {
    var numero = normalizarNumero(document.getElementById("numero").value);
    var telefone = normalizarTelefone(document.getElementById("telefone").value);
    var ok = marcar("numero", !!numero);
    ok = marcar("telefone", !!telefone) && ok;
    if (!ok) return;

    document.getElementById("numero").value = numero;
    mostrar(numero, telefone).then(function () {
      if (window.matchMedia("(max-width: 900px)").matches) {
        resultado.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    pesquisar();
  });

  form.addEventListener("input", function (ev) {
    var bloco = ev.target.closest(".campo.invalido");
    if (bloco) bloco.classList.remove("invalido");
  });

  // Atalho: as encomendas deste dispositivo abrem sem pedir o telefone
  document.getElementById("lista-recentes").addEventListener("click", function (ev) {
    var botao = ev.target.closest("[data-numero]");
    if (!botao) return;
    var enc = lerEncomendas().filter(function (x) { return x.numero === botao.getAttribute("data-numero"); })[0];
    if (!enc) return;
    document.getElementById("numero").value = enc.numero;
    document.getElementById("telefone").value = (enc.cliente.telefone || "").replace("+258 ", "");
    form.querySelectorAll(".campo.invalido").forEach(function (c) { c.classList.remove("invalido"); });
    mostrar(enc.numero, normalizarTelefone(enc.cliente.telefone));
  });

  /* ---------- Arranque ---------- */
  desenharInicial();
  desenharRecentes("");
  RJS.prepararProtecao();

  // Vindo da confirmação (acompanhar.html?n=RJS-123456): preenche e mostra se for deste dispositivo
  var numeroUrl = normalizarNumero(new URLSearchParams(location.search).get("n"));
  if (numeroUrl) {
    document.getElementById("numero").value = numeroUrl;
    var daqui = lerEncomendas().filter(function (x) { return x.numero === numeroUrl; })[0];
    if (daqui) {
      document.getElementById("telefone").value = (daqui.cliente.telefone || "").replace("+258 ", "");
      mostrar(daqui.numero, normalizarTelefone(daqui.cliente.telefone));
    } else {
      document.getElementById("telefone").focus();
    }
  }
})();
