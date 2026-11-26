/* ==========================================================
   RJ SPORTS — Admin: autenticação
   ----------------------------------------------------------
   COM SERVIDOR (window.RJSA_API, vindo de /api/admin/dados.js):
     o login é feito no servidor, que guarda a sessão num cookie
     protegido (httpOnly). A palavra-passe é verificada com bcrypt.
   SEM SERVIDOR (site aberto só com ficheiros):
     a conta fica neste navegador, com a palavra-passe guardada
     como hash SHA-256. Serve para ver o painel, não é segurança real.
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
      entrar: function (email, palavraPasse) {
        return RJS.api("/auth/entrar", { metodo: "POST", corpo: { email: email, palavraPasse: palavraPasse } })
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
     SEM SERVIDOR (só neste navegador)
     ========================================================== */
  var CHAVE_CONTA = "rjs_admin_conta";
  var CHAVE_SESSAO = "rjs_admin_sessao";

  // Conta inicial — mude a palavra-passe em Configurações no primeiro acesso
  var CONTA_INICIAL = {
    nome: "Administrador",
    email: "admin@rjsports.co.mz",
    palavraPasse: "rjsports2026"
  };

  function lerJson(armazem, chave) {
    try {
      return JSON.parse(armazem.getItem(chave) || "null");
    } catch (e) {
      return null;
    }
  }

  function guardarJson(armazem, chave, valor) {
    try {
      armazem.setItem(chave, JSON.stringify(valor));
    } catch (e) {
      /* sem armazenamento disponível */
    }
  }

  /** SHA-256 em hexadecimal (com alternativa simples se o navegador não suportar) */
  function hash(texto) {
    var bytes = new TextEncoder().encode("rjs::" + texto);
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
    }
    var h = 0;
    for (var i = 0; i < bytes.length; i++) h = (h * 31 + bytes[i]) | 0;
    return Promise.resolve("x" + (h >>> 0).toString(16));
  }

  function conta() {
    var c = lerJson(localStorage, CHAVE_CONTA);
    if (c && c.hash) return Promise.resolve(c);
    return hash(CONTA_INICIAL.palavraPasse).then(function (h) {
      var nova = { nome: CONTA_INICIAL.nome, email: CONTA_INICIAL.email, hash: h, inicial: true };
      guardarJson(localStorage, CHAVE_CONTA, nova);
      return nova;
    });
  }

  function sessao() {
    return lerJson(sessionStorage, CHAVE_SESSAO);
  }

  function entrar(email, palavraPasse) {
    return Promise.all([conta(), hash(palavraPasse)]).then(function (r) {
      var c = r[0];
      var ok = c.email.toLowerCase() === String(email).trim().toLowerCase() && c.hash === r[1];
      if (ok) guardarJson(sessionStorage, CHAVE_SESSAO, { nome: c.nome, email: c.email, desde: new Date().toISOString() });
      return ok;
    });
  }

  function sair() {
    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (e) { /* ignora */ }
    location.href = "login.html";
  }

  /** Redireciona para o login se não houver sessão */
  function exigir() {
    if (sessao()) return true;
    var pagina = location.pathname.split("/").pop() + location.search;
    location.replace("login.html?voltar=" + encodeURIComponent(pagina));
    return false;
  }

  function alterarPalavraPasse(atual, nova) {
    return Promise.all([conta(), hash(atual), hash(nova)]).then(function (r) {
      if (r[0].hash !== r[1]) return false;
      var c = r[0];
      c.hash = r[2];
      c.inicial = false;
      guardarJson(localStorage, CHAVE_CONTA, c);
      return true;
    });
  }

  function alterarDados(nome, email) {
    return conta().then(function (c) {
      c.nome = nome;
      c.email = email;
      guardarJson(localStorage, CHAVE_CONTA, c);
      var s = sessao();
      if (s) guardarJson(sessionStorage, CHAVE_SESSAO, Object.assign(s, { nome: nome, email: email }));
      return c;
    });
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

    RJSA.auth.entrar(form.email.value, form.palavraPasse.value).then(function (ok) {
      if (!ok) return falhou();
      var voltar = new URLSearchParams(location.search).get("voltar");
      // só aceita páginas do próprio painel
      location.href = voltar && /^[a-z-]+\.html(\?.*)?$/.test(voltar) ? voltar : "dashboard.html";
    }).catch(function (e) {
      falhou(e.message);
    });
  });
})();
