/* ==========================================================
   RJ SPORTS — Admin: configurações
   - Dados da loja (aparecem no site)
   - Conta do administrador
   - Cópia de segurança e dados de exemplo
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "configuracoes", titulo: "Configurações" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();
  var loja = Object.assign({}, RJS.loja, db.loja || {});

  function campo(id, rotulo, valor, extra) {
    extra = extra || {};
    return '<div class="campo' + (extra.inteiro ? " campo--inteiro" : "") + '" data-campo="' + id + '"><label for="c-' + id + '">' + rotulo + "</label>" +
      (extra.textarea
        ? '<textarea id="c-' + id + '" name="' + id + '">' + e(valor || "") + "</textarea>"
        : '<input id="c-' + id + '" name="' + id + '" type="' + (extra.tipo || "text") + '" value="' + e(valor || "") + '"' +
          (extra.placeholder ? ' placeholder="' + e(extra.placeholder) + '"' : "") + (extra.auto ? ' autocomplete="' + extra.auto + '"' : "") + ">") +
      (extra.ajuda ? '<span class="campo__ajuda">' + extra.ajuda + "</span>" : "") +
      '<span class="campo__erro">' + (extra.erro || "Campo inválido.") + "</span></div>";
  }

  var horarioTexto = (loja.horario || []).map(function (h) { return h[0] + " | " + h[1]; }).join("\n");
  var exemplos = {
    encomendas: db.encomendas.filter(function (x) { return x.exemplo; }).length,
    fornecedores: db.fornecedores.filter(function (x) { return x.exemplo; }).length,
    campanhas: db.campanhas.filter(function (x) { return x.exemplo; }).length,
    despesas: db.despesas.filter(function (x) { return x.exemplo; }).length
  };
  var totalExemplos = exemplos.encomendas + exemplos.fornecedores + exemplos.campanhas + exemplos.despesas;

  conteudo.innerHTML =
    '<div class="grelha-admin" style="max-width:880px">' +

    '<section class="cartao" id="loja"><div class="cartao__topo"><h2>Dados da loja</h2><span class="campo__ajuda">Aparecem no rodapé, contactos e botões de WhatsApp</span></div>' +
    '<form class="cartao__corpo form-admin" id="form-loja" novalidate><div class="grelha-campos">' +
    campo("nome", "Nome da loja", loja.nome) +
    campo("cidade", "Localização", loja.cidade, { placeholder: "Ex.: Maputo, Moçambique" }) +
    campo("telefone", "Telefone (como aparece no site)", loja.telefone, { placeholder: "+258 82 914 9042" }) +
    campo("whatsapp", "Número do WhatsApp", loja.whatsapp, { ajuda: "Só algarismos, com 258 à frente. Ex.: 258829149042", erro: "Use só algarismos, começando por 258 (12 no total)." }) +
    campo("instagram", "Instagram (endereço)", loja.instagram, { tipo: "url", placeholder: "https://instagram.com/…" }) +
    campo("facebook", "Facebook (endereço)", loja.facebook, { tipo: "url", placeholder: "https://facebook.com/…" }) +
    campo("horario", "Horário de atendimento", horarioTexto, { textarea: true, inteiro: true, ajuda: "Uma linha por dia, no formato: Dia | Horas. Ex.: Sábado | 08:00 – 13:00" }) +
    '</div><div><button type="submit" class="btn-adm btn-adm--primario">Guardar dados da loja</button></div></form></section>' +

    '<section class="cartao" id="conta"><div class="cartao__topo"><h2>Conta do administrador</h2></div>' +
    '<div class="cartao__corpo grelha-admin">' +
    '<form class="form-admin" id="form-conta" novalidate><div class="grelha-campos">' +
    campo("contaNome", "Nome", "", { auto: "name" }) +
    campo("contaEmail", "Email de acesso", "", { tipo: "email", auto: "username", erro: "Indique um email válido." }) +
    '</div><div><button type="submit" class="btn-adm">Guardar conta</button></div></form>' +
    '<form class="form-admin" id="form-senha" novalidate style="padding-top:20px;border-top:1px solid var(--admin-borda)">' +
    '<h3 style="font-family:var(--fonte-corpo);font-size:.9375rem;text-transform:none;letter-spacing:0;margin:0">Alterar palavra-passe</h3><div class="grelha-campos grelha-campos--3">' +
    campo("atual", "Palavra-passe atual", "", { tipo: "password", auto: "current-password", erro: "Palavra-passe incorreta." }) +
    campo("nova", "Nova palavra-passe", "", { tipo: "password", auto: "new-password", erro: "Mínimo 8 caracteres." }) +
    campo("confirmar", "Repetir nova", "", { tipo: "password", auto: "new-password", erro: "As palavras-passe não coincidem." }) +
    '</div><div><button type="submit" class="btn-adm btn-adm--primario">Alterar palavra-passe</button></div></form>' +
    "</div></section>" +

    '<section class="cartao" id="dados"><div class="cartao__topo"><h2>Dados do painel</h2></div><div class="cartao__corpo grelha-admin">' +
    (RJSA.modoApi
      ? '<div class="alerta alerta--info" style="margin:0">' + ic.info + "<div><strong>Dados guardados no servidor</strong>" +
        "Produtos, encomendas e configurações ficam na base de dados do servidor e aparecem em qualquer computador. " +
        "Mesmo assim, descarregue uma cópia de segurança de vez em quando.</div></div>"
      : '<div class="alerta" style="margin:0">' + ic.aviso + "<div><strong>Os dados estão guardados só neste navegador</strong>" +
        "O site está a ser usado sem servidor (backend): produtos, encomendas e configurações ficam guardados neste computador. " +
        "Faça cópias de segurança com regularidade. As alterações de produtos só aparecem na loja aberta neste navegador.</div></div>") +
    '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
    '<button class="btn-adm" data-backup>' + ic.descarregar + " Descarregar cópia de segurança</button>" +
    '<label class="btn-adm" style="cursor:pointer">' + ic.carregar + ' Repor a partir de cópia<input type="file" accept="application/json,.json" data-importar hidden></label>' +
    '<button class="btn-adm" data-catalogo>' + ic.descarregar + " Descarregar catálogo (JSON)</button>" +
    "</div>" +
    '<div style="padding-top:16px;border-top:1px solid var(--admin-borda)">' +
    "<strong style=\"display:block;margin-bottom:4px\">Dados de exemplo</strong>" +
    '<p class="campo__ajuda" style="margin:0 0 12px">' +
    (totalExemplos
      ? "Há " + exemplos.encomendas + " encomendas, " + exemplos.fornecedores + " fornecedores, " + exemplos.campanhas + " campanha(s) e " + exemplos.despesas +
        " despesa(s) de exemplo. Apague-os antes de começar a usar o painel a sério."
      : "Já não há dados de exemplo.") + "</p>" +
    '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
    (totalExemplos ? '<button class="btn-adm btn-adm--perigo" data-limpar-exemplos>' + ic.apagar + " Apagar dados de exemplo</button>" : "") +
    (RJSA.modoApi ? "" : '<button class="btn-adm btn-adm--perigo" data-repor>Repor tudo como no início</button>') +
    "</div></div>" +
    "</div></section>" +
    "</div>";

  /* ---------- Conta: preencher ---------- */
  RJSA.auth.conta().then(function (c) {
    document.getElementById("c-contaNome").value = c.nome;
    document.getElementById("c-contaEmail").value = c.email;
  });

  function marcar(form, id, ok) {
    form.querySelector('[data-campo="' + id + '"]').classList.toggle("invalido", !ok);
    return ok;
  }

  conteudo.addEventListener("input", function (ev) {
    var b = ev.target.closest(".campo.invalido");
    if (b) b.classList.remove("invalido");
  });

  /* ---------- Dados da loja ---------- */
  document.getElementById("form-loja").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target;
    var whatsapp = f.whatsapp.value.replace(/\D/g, "");
    if (!marcar(f, "whatsapp", /^258\d{9}$/.test(whatsapp))) return;
    var horario = f.horario.value.split("\n").map(function (l) {
      var p = l.split("|");
      return p.length === 2 ? [p[0].trim(), p[1].trim()] : null;
    }).filter(Boolean);
    db.loja = {
      nome: f.nome.value.trim(),
      cidade: f.cidade.value.trim(),
      telefone: f.telefone.value.trim(),
      whatsapp: whatsapp,
      instagram: f.instagram.value.trim(),
      facebook: f.facebook.value.trim(),
      horario: horario.length ? horario : undefined
    };
    RJSA.db.guardar().then(function (ok) {
      if (ok) RJSA.aviso(RJSA.modoApi ? "Dados da loja guardados. Já aparecem no site." : "Dados da loja guardados. Já aparecem no site (neste navegador).");
    });
  });

  /* ---------- Conta ---------- */
  document.getElementById("form-conta").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target;
    var nome = f.contaNome.value.trim();
    var email = f.contaEmail.value.trim();
    var ok = marcar(f, "contaNome", nome.length >= 2);
    ok = marcar(f, "contaEmail", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) && ok;
    if (!ok) return;
    RJSA.auth.alterarDados(nome, email).then(function () {
      RJSA.aviso("Conta atualizada.");
    });
  });

  document.getElementById("form-senha").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target;
    var ok = marcar(f, "nova", f.nova.value.length >= 8);
    ok = marcar(f, "confirmar", f.nova.value === f.confirmar.value) && ok;
    if (!ok) return;
    RJSA.auth.alterarPalavraPasse(f.atual.value, f.nova.value).then(function (certo) {
      if (!marcar(f, "atual", certo)) return;
      f.reset();
      RJSA.aviso("Palavra-passe alterada.");
    });
  });

  /* ---------- Dados ---------- */
  var dataHoje = new Date().toISOString().slice(0, 10);

  conteudo.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-backup]")) {
      RJSA.descarregar(JSON.stringify(db, null, 2), "rj-sports-copia-" + dataHoje + ".json", "application/json");
      RJSA.aviso("Cópia de segurança descarregada.");
    }

    if (ev.target.closest("[data-catalogo]")) {
      var catalogo = {
        categorias: db.categorias,
        produtos: db.produtos.map(function (p) {
          var c = Object.assign({}, p);
          if (/^data:/.test(c.imagem || "")) c.imagem = "(foto carregada no painel — guardar como ficheiro em assets/images/produtos/" + c.id + ".jpg)";
          return c;
        })
      };
      RJSA.descarregar(JSON.stringify(catalogo, null, 2), "rj-sports-catalogo-" + dataHoje + ".json", "application/json");
      RJSA.aviso("Catálogo descarregado.");
    }

    if (ev.target.closest("[data-limpar-exemplos]")) {
      RJSA.confirmar({
        titulo: "Apagar dados de exemplo",
        texto: "Vai apagar as encomendas, fornecedores, campanhas e despesas marcados como exemplo. Os produtos e as encomendas reais ficam. Continuar?",
        botao: "Apagar exemplos",
        perigo: true
      }).then(function (sim) {
        if (!sim) return;
        var fornecedoresExemplo = db.fornecedores.filter(function (x) { return x.exemplo; }).map(function (x) { return x.id; });
        db.encomendas = db.encomendas.filter(function (x) { return !x.exemplo; });
        db.fornecedores = db.fornecedores.filter(function (x) { return !x.exemplo; });
        db.campanhas = db.campanhas.filter(function (x) { return !x.exemplo; });
        db.despesas = db.despesas.filter(function (x) { return !x.exemplo; });
        db.produtos.forEach(function (p) {
          if (fornecedoresExemplo.indexOf(p.fornecedorId) > -1) p.fornecedorId = "";
        });
        RJSA.db.guardar().then(function () {
          RJSA.flash("Dados de exemplo apagados.");
          location.reload();
        });
      });
    }

    if (ev.target.closest("[data-repor]")) {
      RJSA.confirmar({
        titulo: "Repor tudo",
        texto: "Vai apagar TODAS as alterações do painel (produtos, encomendas, fornecedores, configurações) e voltar aos dados de origem com exemplos. Descarregue antes uma cópia de segurança. Esta ação não pode ser desfeita.",
        botao: "Repor tudo",
        perigo: true
      }).then(function (sim) {
        if (!sim) return;
        RJSA.db.repor().then(function () {
          RJSA.flash("Painel reposto como no início.");
          location.reload();
        });
      });
    }
  });

  conteudo.addEventListener("change", function (ev) {
    if (!ev.target.matches("[data-importar]")) return;
    var ficheiro = ev.target.files[0];
    if (!ficheiro) return;
    var leitor = new FileReader();
    leitor.onload = function () {
      var novo;
      try {
        novo = JSON.parse(leitor.result);
      } catch (err) {
        novo = null;
      }
      if (!novo || !novo.versao || !Array.isArray(novo.produtos) || !Array.isArray(novo.encomendas)) {
        RJSA.aviso("Este ficheiro não é uma cópia de segurança do painel.", "erro");
        return;
      }
      RJSA.confirmar({
        titulo: "Repor cópia de segurança",
        texto: "Substituir todos os dados atuais pelos da cópia (" + novo.produtos.length + " produtos, " + novo.encomendas.length + " encomendas)?",
        botao: "Repor cópia"
      }).then(function (sim) {
        if (!sim) return;
        RJSA.db.substituir(novo).then(function (ok) {
          if (!ok) return;
          RJSA.flash("Cópia de segurança reposta.");
          location.reload();
        });
      });
    };
    leitor.readAsText(ficheiro);
    ev.target.value = "";
  });

  // abrir na secção pedida (#conta, #dados)
  if (location.hash) {
    var alvo = document.querySelector(location.hash);
    if (alvo) setTimeout(function () { alvo.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  }
})();
