/* ==========================================================
   RJ SPORTS — Admin: categorias
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "categorias", titulo: "Categorias" });
  if (!conteudo) return;

  var e = RJSA.e;
  var db = RJSA.db.obter();

  function contar(id) {
    return db.produtos.filter(function (p) { return p.categoria === id; }).length;
  }

  RJSA.crud({
    alvo: conteudo,
    colecao: "categorias",
    novoRotulo: "Nova categoria",
    tituloNovo: "Nova categoria",
    tituloEditar: "Editar categoria",
    vazio: "Ainda não há categorias.",
    pesquisar: function (c) { return c.nome + " " + (c.descricao || ""); },
    nome: function (c) { return c.nome; },
    antes: function () {
      return '<div class="alerta alerta--info">' + RJSA.icones.info +
        "<div><strong>Categorias por desporto</strong>As categorias aparecem nos filtros da loja, na página “Categorias” e nos cartões da página inicial. " +
        "O público (Homem, Mulher, Criança) e as idades escolhem-se em cada produto.</div></div>";
    },
    campos: [
      { id: "nome", rotulo: "Nome", obrigatorio: true, inteiro: true, placeholder: "Ex.: Basquetebol" },
      { id: "descricao", rotulo: "Descrição curta", inteiro: true, placeholder: "Ex.: Bolas, sapatilhas e equipamentos" }
    ],
    gerarId: function (r) {
      var base = RJSA.slug(r.nome) || "categoria";
      var id = base;
      var n = 2;
      while (db.categorias.some(function (c) { return c.id === id; })) id = base + "-" + n++;
      return id;
    },
    antesGuardar: function (r, item) {
      var repetida = db.categorias.some(function (c) {
        return c !== item && RJSA.slug(c.nome) === RJSA.slug(r.nome);
      });
      if (repetida) {
        RJSA.aviso("Já existe uma categoria com esse nome.", "erro");
        return false;
      }
    },
    podeApagar: function (c) {
      var n = contar(c.id);
      return n ? "Não pode apagar: há " + n + " produto(s) nesta categoria. Mude-os de categoria primeiro." : true;
    },
    colunas: [
      { rotulo: "Categoria", valor: function (c) { return "<strong>" + e(c.nome) + "</strong>"; } },
      { rotulo: "Descrição", valor: function (c) { return e(c.descricao || "—"); } },
      { rotulo: "Produtos", classe: "num", valor: function (c) {
          return '<a class="ligacao" href="produtos.html" data-cat="' + e(c.id) + '">' + contar(c.id) + "</a>";
        } },
      { rotulo: "Na loja", valor: function (c) {
          return '<a class="ligacao" href="../loja.html?c=' + encodeURIComponent(c.id) + '" target="_blank" rel="noopener">Ver ↗</a>';
        } }
    ]
  });
})();
