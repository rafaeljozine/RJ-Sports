/* ==========================================================
   RJ SPORTS — Admin: campanhas e códigos de desconto
   ========================================================== */

(function () {
  var conteudo = RJSA.montar({ pagina: "campanhas", titulo: "Campanhas" });
  if (!conteudo) return;

  var e = RJSA.e;
  var ic = RJSA.icones;
  var db = RJSA.db.obter();

  function estadoCampanha(c) {
    if (!c.ativa) return { texto: "Desligada", classe: "inativo" };
    var hoje = new Date().toISOString().slice(0, 10);
    if (c.inicio && hoje < c.inicio) return { texto: "Agendada", classe: "aviso" };
    if (c.fim && hoje > c.fim) return { texto: "Terminada", classe: "inativo" };
    return { texto: "A decorrer", classe: "ativo" };
  }

  RJSA.crud({
    alvo: conteudo,
    colecao: "campanhas",
    prefixo: "camp",
    novoRotulo: "Nova campanha",
    tituloNovo: "Nova campanha",
    tituloEditar: "Editar campanha",
    vazio: "Ainda não há campanhas.",
    pesquisar: function (c) { return c.nome + " " + (c.codigo || ""); },
    nome: function (c) { return c.nome; },
    antes: function () {
      var produtosPromo = db.produtos.filter(function (p) { return p.precoAntigo && p.precoAntigo > p.preco; }).length;
      return '<div class="alerta alerta--info">' + ic.info +
        "<div><strong>Promoções e códigos</strong>Para pôr um produto em promoção na loja, edite-o e preencha o “Preço antigo” — há " +
        produtosPromo + ' produto(s) em promoção agora (<a href="produtos.html">ver produtos</a>). ' +
        "Os clientes escrevem o código no checkout: o desconto só é aceite com a campanha ligada, dentro das datas e acima da compra mínima, e fica registado na encomenda.</div></div>";
    },
    campos: [
      { id: "nome", rotulo: "Nome da campanha", obrigatorio: true, inteiro: true, placeholder: "Ex.: Regresso às aulas" },
      { id: "codigo", rotulo: "Código", placeholder: "Ex.: ESCOLA15", ajuda: "Letras e números, sem espaços.",
        validar: function (v) { return !v || /^[A-Za-z0-9_-]+$/.test(v); }, erro: "Use só letras, números, - ou _." },
      { id: "tipo", rotulo: "Tipo de desconto", tipo: "select", opcoes: [{ valor: "percentagem", texto: "Percentagem (%)" }, { valor: "valor", texto: "Valor fixo (MT)" }] },
      { id: "valor", rotulo: "Desconto", tipo: "number", min: 0, obrigatorio: true,
        validar: function (v, r) { return v > 0 && (r.tipo !== "percentagem" || v <= 90); }, erro: "Indique um desconto válido (percentagem até 90%)." },
      { id: "minimo", rotulo: "Compra mínima", tipo: "number", min: 0, passo: 50, sufixo: "MT" },
      { id: "inicio", rotulo: "Início", tipo: "date" },
      { id: "fim", rotulo: "Fim", tipo: "date",
        validar: function (v, r) { return !v || !r.inicio || v >= r.inicio; }, erro: "O fim tem de ser depois do início." },
      { id: "ativa", rotulo: "Campanha ligada", tipo: "interruptor", padrao: true, inteiro: true }
    ],
    antesGuardar: function (r, item) {
      if (r.codigo) r.codigo = r.codigo.toUpperCase();
      var repetido = r.codigo && db.campanhas.some(function (c) { return c !== item && c.codigo === r.codigo; });
      if (repetido) {
        RJSA.aviso("Esse código já existe.", "erro");
        return false;
      }
    },
    ordenar: function (a, b) { return (b.inicio || "").localeCompare(a.inicio || ""); },
    colunas: [
      { rotulo: "Campanha", valor: function (c) { return "<strong>" + e(c.nome) + "</strong>"; } },
      { rotulo: "Código", valor: function (c) {
          return c.codigo ? '<code style="padding:2px 8px;border-radius:4px;background:#eef2ff;color:var(--cor-destaque);font-weight:700">' + e(c.codigo) + "</code>" : "—";
        } },
      { rotulo: "Desconto", valor: function (c) {
          return c.tipo === "valor" ? RJSA.preco(c.valor) : c.valor + "%";
        } },
      { rotulo: "Compra mínima", classe: "num", valor: function (c) { return c.minimo ? RJSA.preco(c.minimo) : "—"; } },
      { rotulo: "Período", valor: function (c) {
          if (!c.inicio && !c.fim) return "Sem datas";
          return (c.inicio ? RJSA.data(c.inicio) : "…") + " → " + (c.fim ? RJSA.data(c.fim) : "…");
        } },
      { rotulo: "Estado", valor: function (c) {
          var s = estadoCampanha(c);
          return '<span class="estado estado--' + s.classe + '">' + s.texto + "</span>";
        } }
    ]
  });
})();
