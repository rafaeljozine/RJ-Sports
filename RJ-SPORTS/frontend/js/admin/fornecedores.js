/* ==========================================================
   RJ SPORTS — Admin: fornecedores (dropshipping)
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "fornecedores", titulo: "Fornecedores" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();

  function produtosDe(id) {
    return db.produtos.filter(function (p) { return p.fornecedorId === id; });
  }

  // encomendas ativas com produtos deste fornecedor ainda sem pedido feito
  function pendentesDe(id) {
    return db.encomendas.filter(function (enc) {
      if (enc.pedidoFornecedor || enc.estado === "Cancelada" || enc.estado === "Entregue") return false;
      return enc.itens.some(function (i) {
        var p = db.produtos.filter(function (x) { return x.id === i.id; })[0];
        return p && p.fornecedorId === id;
      });
    }).length;
  }

  RJSA.crud({
    alvo: conteudo,
    colecao: "fornecedores",
    prefixo: "forn",
    novoRotulo: "Novo fornecedor",
    tituloNovo: "Novo fornecedor",
    tituloEditar: "Editar fornecedor",
    vazio: "Ainda não há fornecedores.",
    pesquisar: function (f) { return f.nome + " " + (f.cidade || "") + " " + (f.contacto || ""); },
    nome: function (f) { return f.nome; },
    antes: function () {
      return '<div class="alerta alerta--info">' + ic.info +
        "<div><strong>Como funciona o dropshipping aqui</strong>Associe cada produto a um fornecedor (em Produtos → Editar). " +
        "Na página de cada encomenda aparece o botão para enviar o pedido ao fornecedor pelo WhatsApp, com os artigos e a morada do cliente.</div></div>";
    },
    campos: [
      { id: "nome", rotulo: "Nome do fornecedor", obrigatorio: true, inteiro: true },
      { id: "contacto", rotulo: "Pessoa de contacto" },
      { id: "telefone", rotulo: "Telefone / WhatsApp", tipo: "tel", placeholder: "+258 84 123 4567" },
      { id: "email", rotulo: "Email", tipo: "email" },
      { id: "cidade", rotulo: "Cidade / país", placeholder: "Ex.: Maputo" },
      { id: "prazo", rotulo: "Prazo de envio", placeholder: "Ex.: 2–3 dias" },
      { id: "notas", rotulo: "Notas", tipo: "textarea", inteiro: true, placeholder: "Condições, forma de pagamento ao fornecedor, etc." }
    ],
    podeApagar: function (f) {
      var n = produtosDe(f.id).length;
      return n ? "Não pode apagar: há " + n + " produto(s) deste fornecedor. Mude-os primeiro." : true;
    },
    colunas: [
      { rotulo: "Fornecedor", valor: function (f) {
          return "<strong>" + e(f.nome) + "</strong>" + (f.contacto ? "<br><small>" + e(f.contacto) + "</small>" : "");
        } },
      { rotulo: "Contacto", valor: function (f) {
          var partes = [];
          if (f.telefone) partes.push('<a class="ligacao" target="_blank" rel="noopener" href="' + RJSA.linkWhatsapp(f.telefone) + '">' + e(f.telefone) + "</a>");
          if (f.email) partes.push('<a class="ligacao" href="mailto:' + e(f.email) + '">' + e(f.email) + "</a>");
          return partes.join("<br>") || "—";
        } },
      { rotulo: "Local", valor: function (f) { return e(f.cidade || "—"); } },
      { rotulo: "Prazo", valor: function (f) { return e(f.prazo || "—"); } },
      { rotulo: "Produtos", classe: "num", valor: function (f) { return produtosDe(f.id).length; } },
      { rotulo: "Pedidos por fazer", classe: "num", valor: function (f) {
          var n = pendentesDe(f.id);
          return n ? '<span class="estado estado--aviso">' + n + "</span>" : "0";
        } }
    ]
  });
})();
