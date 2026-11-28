/* ==========================================================
   RJ SPORTS — Admin: autenticação
   ----------------------------------------------------------
   COM SERVIDOR (window.RJSA_API, vindo de /api/admin/dados.js):
     o login é feito no servidor, que guarda a sessão num cookie
     protegido (httpOnly). A palavra-passe é verificada com bcrypt.
   SEM SERVIDOR: só em localhost (ver RJS.local em js/produtos.js),
     como DEMONSTRAÇÃO do design — sem palavra-passe nenhuma no
     código e sem dados reais. Num site público sem servidor o
     painel não abre (nunca há um "login local" de recurso).
   ========================================================== */

window.RJSA = window.RJSA || {};

RJSA.auth = (function () {
  var API = !!window.RJSA_API;

  /* ==========================================================
     COM SERVIDOR
     ========================================================== */
  if (API) {
    var dados = window.RJSA_DADOS; // null quando não há sessão

    return {
      api: true,
      conta: function () {
        return Promise.resolve(dados ? dados.conta : null);
      },
      sessao: function () {
        return dados ? { nome: dados.conta.nome, email: dados.conta.email } : null;
      },
      entrar: function (email, palavraPasse, armadilha) {
        return RJS.api("/auth/entrar", {
          metodo: "POST",
          protegido: true,
          armadilha: armadilha,
          corpo: { email: email, palavraPasse: palavraPasse }
        })
          .then(function () { return true; })
          .catch(function (erro) {
            if (erro.estado === 401 || erro.estado === 400) return false;
            throw erro;
          });
      },
      sair: function () {
        RJS.api("/auth/sair", { metodo: "POST" }).catch(function () {}).then(function () {
          location.href = "login.html";
        });
      },
      exigir: function () {
        if (dados) return true;
        var pagina = location.pathname.split("/").pop() + location.search;
        location.replace("login.html?voltar=" + encodeURIComponent(pagina));
        return false;
      },
      alterarPalavraPasse: function (atual, nova) {
        return RJS.api("/auth/palavra-passe", { metodo: "PUT", corpo: { atual: atual, nova: nova } })
          .then(function (conta) {
            dados.conta = conta;
            return true;
          })
          .catch(function (erro) {
            if (erro.estado === 400) return false;
            throw erro;
          });
      },
      alterarDados: function (nome, email) {
        return RJS.api("/auth/conta", { metodo: "PUT", corpo: { nome: nome, email: email } }).then(function (conta) {
          dados.conta = conta;
          return conta;
        });
      }
    };
  }

  /* ==========================================================
     SEM SERVIDOR
     ========================================================== */
  var CHAVE_SESSAO = "rjs_admin_sessao";

  // limpa a conta local antiga (tinha palavra-passe guardada no navegador)
  try { localStorage.removeItem("rjs_admin_conta"); } catch (e) { /* ignora */ }

  function lerSessao() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || "null");
    } catch (e) {
      return null;
    }
  }

  function guardarSessao(valor) {
    try {
      if (valor) sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(valor));
      else sessionStorage.removeItem(CHAVE_SESSAO);
    } catch (e) {
      /* sem armazenamento disponível */
    }
  }

  var DEMO = { nome: "Demonstração", email: "demo@localhost", inicial: false };

  function conta() {
    return Promise.resolve(RJS.local ? DEMO : null);
  }

  // Site público sem servidor: não há sessão possível
  function sessao() {
    return RJS.local ? lerSessao() : null;
  }

  function entrar() {
    if (!RJS.local) {
      return Promise.reject(new Error("O servidor do painel não respondeu. Tente novamente daqui a pouco."));
    }
    guardarSessao({ nome: DEMO.nome, email: DEMO.email, desde: new Date().toISOString() });
    return Promise.resolve(true);
  }

  function sair() {
    guardarSessao(null);
    location.href = "login.html";
  }

  /** Redireciona para o login se não houver sessão */
  function exigir() {
    if (sessao()) return true;
    var pagina = location.pathname.split("/").pop() + location.search;
    location.replace("login.html?voltar=" + encodeURIComponent(pagina));
    return false;
  }

  // Na demonstração não há palavra-passe para mudar
  function alterarPalavraPasse() {
    return Promise.resolve(true);
  }

  function alterarDados(nome, email) {
    return Promise.resolve({ nome: nome, email: email, inicial: false });
  }

  return {
    api: false,
    conta: conta,
    sessao: sessao,
    entrar: entrar,
    sair: sair,
    exigir: exigir,
    alterarPalavraPasse: alterarPalavraPasse,
    alterarDados: alterarDados
  };
})();

/* ---------- Página de login ---------- */
(function () {
  var form = document.getElementById("form-login");
  if (!form) return;

  // Já tem sessão? Vai direto para o painel
  if (RJSA.auth.sessao()) {
    location.replace("dashboard.html");
    return;
  }

  var erro = document.getElementById("login-erro");
  var botao = form.querySelector('button[type="submit"]');
  RJS.prepararProtecao();

  if (!RJSA.auth.api && RJS.local) {
    var nota = document.createElement("p");
    nota.className = "login__nota";
    nota.textContent = "Modo de demonstração (sem servidor): escreva qualquer email e palavra-passe. Os dados ficam só neste navegador.";
    form.insertBefore(nota, form.firstChild);
  }

  function falhou(mensagem) {
    erro.textContent = mensagem || "Email ou palavra-passe incorretos.";
    erro.hidden = false;
    botao.disabled = false;
    botao.textContent = "Entrar";
    form.palavraPasse.value = "";
    form.palavraPasse.focus();
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    erro.hidden = true;
    botao.disabled = true;
    botao.textContent = "A entrar…";

    RJSA.auth.entrar(form.email.value, form.palavraPasse.value, form.website ? form.website.value : "").then(function (ok) {
      if (!ok) return falhou();
      var voltar = new URLSearchParams(location.search).get("voltar");
      // só aceita páginas do próprio painel
      location.href = voltar && /^[a-z-]+\.html(\?.*)?$/.test(voltar) ? voltar : "dashboard.html";
    }).catch(function (e) {
      falhou(e.message);
    });
  });
})();
