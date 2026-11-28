/* ==========================================================
   RJ SPORTS — código da página contactos.html
   (fora do HTML para a Content-Security-Policy não precisar
   de permitir scripts embutidos)
   ========================================================== */

(function () {
  var l = RJS.loja;
  var e = RJS.escapar;
  var whatsapp = RJS.iconesCompra.whatsapp;
  var seta = '<svg class="cartao-contacto__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var telefone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';
  var instagram = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>';
  var facebook = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z"/></svg>';
  var local = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>';

  function cartao(href, icone, classeIcone, rotulo, valor, externo) {
    var tag = href ? "a" : "div";
    return (
      "<" + tag + ' class="cartao-contacto"' + (href ? ' href="' + href + '"' : "") +
      (externo ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<span class="cartao-contacto__icone' + classeIcone + '">' + icone + "</span>" +
      "<div><strong>" + rotulo + "</strong><span>" + e(valor) + "</span></div>" +
      (href ? seta : "<span></span>") +
      "</" + tag + ">"
    );
  }

  document.getElementById("cartoes-contacto").innerHTML =
    cartao("https://wa.me/" + l.whatsapp, whatsapp, " cartao-contacto__icone--whatsapp", "WhatsApp", l.telefone, true) +
    cartao("tel:" + l.telefone.replace(/\s/g, ""), telefone, "", "Telefone", l.telefone, false) +
    cartao(l.instagram, instagram, "", "Instagram", "@" + l.instagram.split("/").pop(), true) +
    cartao(l.facebook, facebook, "", "Facebook", l.facebook.replace(/^https?:\/\//, ""), true) +
    cartao("", local, "", "Localização", l.cidade + " · Entregas em todo o país", false);

  document.getElementById("horario").innerHTML = (l.horario || []).map(function (h) {
    return "<dt>" + e(h[0]) + "</dt><dd>" + e(h[1]) + "</dd>";
  }).join("");

  /* Formulário → WhatsApp */
  var form = document.getElementById("form-contacto");

  function valor(id) {
    return document.getElementById(id).value.trim();
  }

  function marcar(campo, ok) {
    form.querySelector('[data-campo="' + campo + '"]').classList.toggle("invalido", !ok);
    return ok;
  }

  form.addEventListener("input", function (ev) {
    var bloco = ev.target.closest(".campo.invalido");
    if (bloco) bloco.classList.remove("invalido");
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = marcar("nome", valor("contacto-nome").length >= 2);
    ok = marcar("mensagem", valor("contacto-mensagem").length >= 3) && ok;
    if (!ok) {
      form.querySelector(".campo.invalido input, .campo.invalido textarea").focus();
      return;
    }

    var linhas = [
      "Olá RJ Sports! Sou " + valor("contacto-nome") + ".",
      "Assunto: " + valor("contacto-assunto")
    ];
    if (valor("contacto-encomenda")) linhas.push("Encomenda: " + valor("contacto-encomenda").toUpperCase());
    linhas.push("", valor("contacto-mensagem"));

    window.open("https://wa.me/" + l.whatsapp + "?text=" + encodeURIComponent(linhas.join("\n")), "_blank", "noopener");
    RJS.aviso("A abrir o WhatsApp…");
  });
})();
