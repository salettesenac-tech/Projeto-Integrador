// ==============================
// Autenticação — API + cookie de sessão
// Usuários, sessões e histórico ficam no PostgreSQL.
// O localStorage guarda apenas cache de exibição, tema e avatar.
// ==============================

const SESSION_KEY = "vivalingua_session";
const RESET_KEY = "vivalingua_reset";
const RESET_IDENTIFICADOR_KEY = "vivalingua_reset_identificador";
const RESET_DESTINO_KEY = "vivalingua_reset_destino";
const RESET_DEMO_KEY = "vivalingua_codigo_demo";

function showFeedback(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("d-none");
}

function setCarregando(botao, carregando) {
  if (!botao) return;

  if (carregando) {
    if (!botao.dataset.textoOriginal) {
      botao.dataset.textoOriginal = botao.innerHTML;
    }
    botao.disabled = true;
    botao.textContent = "Aguarde...";
    return;
  }

  botao.disabled = false;

  if (botao.dataset.textoOriginal) {
    botao.innerHTML = botao.dataset.textoOriginal;
    delete botao.dataset.textoOriginal;
  }
}

function caminhoIndex() {
  return window.location.pathname.includes("/src/paginas/")
    ? "../../index.html"
    : "index.html";
}

function normalizePhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

function maskPhone(phone) {
  const digits = normalizePhone(phone);

  if (digits.length < 4) return "••••";

  return "+**" + "*".repeat(Math.max(digits.length - 4, 4)) + digits.slice(-2);
}

function isValidPhone(phone) {
  const digits = normalizePhone(phone);

  return digits.length >= 10 && digits.length <= 13;
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function isValidEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

// ==============================
// SESSÃO
// ==============================

function salvarSessaoLocal(usuario) {
  try {
    const sessao = {
      name: usuario.nome || usuario.name,
      email: usuario.email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  } catch (e) {}
}

function limparSessaoLocal() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

async function carregarSessao() {
  try {
    const { usuario } = await apiFetch("/auth/me");

    if (!usuario) {
      limparSessaoLocal();
      return null;
    }

    salvarSessaoLocal(usuario);
    return usuario;
  } catch (e) {
    limparSessaoLocal();
    return null;
  }
}

// ==============================
// TEMA CLARO / ESCURO
// ==============================

function configurarTema() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      if (themeIcon) themeIcon.className = "bi bi-moon-fill";
      if (themeLabel) themeLabel.textContent = "Modo escuro";
    } else {
      document.documentElement.classList.remove("dark");
      if (themeIcon) themeIcon.className = "bi bi-sun-fill";
      if (themeLabel) themeLabel.textContent = "Modo claro";
    }
  }

  applyTheme(localStorage.getItem("vivalingua_theme") || "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("dark")
        ? "light"
        : "dark";

      localStorage.setItem("vivalingua_theme", next);
      applyTheme(next);
    });
  }
}

// ==============================
// OLHINHO DA SENHA
// ==============================

function configurarOlhinhos() {
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);

      if (!target) return;

      const icon = btn.querySelector("i");

      if (target.type === "password") {
        target.type = "text";
        if (icon) icon.className = "bi bi-eye-slash";
      } else {
        target.type = "password";
        if (icon) icon.className = "bi bi-eye";
      }
    });
  });
}

// ==============================
// MEDIDOR DE FORÇA DA SENHA
// ==============================

function configurarMedidorSenha() {
  const passwordInput = document.getElementById("cadastroPassword");
  const strengthBarFill = document.getElementById("strengthBarFill");
  const strengthText = document.getElementById("strengthText");

  if (!passwordInput || !strengthBarFill || !strengthText) return;

  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    const checks = [
      { ok: value.length >= 8, label: "caracteres" },
      { ok: /[A-Z]/.test(value), label: "maiúscula" },
      { ok: /[a-z]/.test(value), label: "minúscula" },
      { ok: /[0-9]/.test(value), label: "número" },
      { ok: /[^A-Za-z0-9]/.test(value), label: "símbolo" },
    ];

    const met = checks.filter((c) => c.ok).length;
    const missing = checks.filter((c) => !c.ok).map((c) => c.label);

    let level, color;

    if (value.length === 0) {
      level = "";
      color = "transparent";
    } else if (met <= 2) {
      level = "Fraca";
      color = "#C0392B";
    } else if (met <= 3) {
      level = "Média";
      color = "#E67E22";
    } else if (met === 4) {
      level = "Boa";
      color = "#F1C40F";
    } else {
      level = "Forte";
      color = "#4CAF7D";
    }

    strengthBarFill.style.width = (met / checks.length) * 100 + "%";
    strengthBarFill.style.backgroundColor = color;
    strengthText.textContent =
      value.length === 0
        ? ""
        : missing.length
          ? `Falta: ${missing.join(", ")}`
          : "Senha segura!";

    strengthText.dataset.level = level;
  });
}

// ==============================
// AVATAR (cache local do dispositivo)
// ==============================

function configurarAvatar() {
  const avatarInput = document.getElementById("avatarInput");
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileAvatarIcon = document.getElementById("profileAvatarIcon");

  if (!avatarInput || !changeAvatarBtn || !profileAvatar) return;

  const savedAvatar = localStorage.getItem("vivalingua_avatar");

  if (savedAvatar) {
    profileAvatar.style.backgroundImage = `url(${savedAvatar})`;
    profileAvatar.classList.add("has-image");
    if (profileAvatarIcon) profileAvatarIcon.style.display = "none";
  }

  changeAvatarBtn.addEventListener("click", () => avatarInput.click());

  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      localStorage.setItem("vivalingua_avatar", event.target.result);
      profileAvatar.style.backgroundImage = `url(${event.target.result})`;
      profileAvatar.classList.add("has-image");
      if (profileAvatarIcon) profileAvatarIcon.style.display = "none";
    };

    reader.readAsDataURL(file);
  });
}

// ==============================
// HEADER / SESSÃO
// ==============================

function configurarHeader(sessao) {
  const navLogin = document.getElementById("navLogin");
  const navUser = document.getElementById("navUser");

  if (sessao && navLogin && navUser) {
    navLogin.classList.add("d-none");
    navUser.classList.remove("d-none");

    const navUserName = document.getElementById("navUserName");
    if (navUserName) navUserName.textContent = sessao.nome || sessao.name;

    const savedAvatarNav = localStorage.getItem("vivalingua_avatar");
    const navUserAvatar = document.getElementById("navUserAvatar");
    const navUserIcon = document.getElementById("navUserIcon");

    if (savedAvatarNav && navUserAvatar) {
      navUserAvatar.src = savedAvatarNav;
      navUserAvatar.classList.remove("d-none");
      if (navUserIcon) navUserIcon.classList.add("d-none");
    }
  }

  const navLogout = document.getElementById("navLogout");

  if (navLogout) {
    navLogout.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } catch (e) {}

      limparSessaoLocal();
      window.location.href = caminhoIndex();
    });
  }
}

// ==============================
// CADASTRO
// ==============================

function configurarCadastro() {
  const cadastroForm = document.getElementById("cadastroForm");

  if (!cadastroForm) return;

  cadastroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("cadastroName").value.trim();
    const email = document.getElementById("cadastroEmail").value.trim();
    const phone = document.getElementById("cadastroPhone").value.trim();
    const password = document.getElementById("cadastroPassword").value;
    const confirm = document.getElementById("cadastroConfirm").value;
    const feedback = document.getElementById("cadastroFeedback");

    if (!name || !email || !password || !confirm) {
      showFeedback(feedback, "Preencha todos os campos para continuar.");
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback(feedback, "Digite um e-mail válido.");
      return;
    }

    if (phone && !isValidPhone(phone)) {
      showFeedback(feedback, "Digite um telefone válido com DDD.");
      return;
    }

    if (!isStrongPassword(password)) {
      showFeedback(
        feedback,
        "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo."
      );
      return;
    }

    if (password !== confirm) {
      showFeedback(feedback, "As senhas não coincidem.");
      return;
    }

    const botao = cadastroForm.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome: name,
          email,
          telefone: phone,
          senha: password,
        }),
      });

      showFeedback(feedback, "Conta criada com sucesso! Redirecionando...");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });
}

// ==============================
// LOGIN
// ==============================

function configurarLogin() {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const identificador = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const feedback = document.getElementById("loginFeedback");

    if (!identificador || !password) {
      showFeedback(feedback, "Preencha e-mail e senha para continuar.");
      return;
    }

    if (!isValidEmail(identificador) && !isValidPhone(identificador)) {
      showFeedback(feedback, "Digite um e-mail ou telefone válido.");
      return;
    }

    const botao = loginForm.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      const { usuario } = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identificador, senha: password }),
      });

      salvarSessaoLocal(usuario);
      showFeedback(feedback, "Login realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 1200);
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });
}

// ==============================
// ESQUECI MINHA SENHA
// ==============================

function configurarRecuperacao() {
  const recoverForm = document.getElementById("recoverForm");

  if (!recoverForm) return;

  recoverForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const valor = document.getElementById("recoverInput").value.trim();
    const feedback = document.getElementById("recoverFeedback");

    if (!valor) {
      showFeedback(feedback, "Informe seu telefone ou e-mail.");
      return;
    }

    const botao = recoverForm.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      const dados = await apiFetch("/auth/forgot", {
        method: "POST",
        body: JSON.stringify({ identificador: valor }),
      });

      localStorage.setItem(RESET_IDENTIFICADOR_KEY, valor);
      localStorage.setItem(RESET_DESTINO_KEY, dados.destino || valor);

      if (dados.codigoDemo) {
        sessionStorage.setItem(RESET_DEMO_KEY, dados.codigoDemo);
      } else {
        sessionStorage.removeItem(RESET_DEMO_KEY);
      }

      document.getElementById("recoverCard").classList.add("d-none");

      const sentCard = document.getElementById("sentCard");
      sentCard.classList.remove("d-none");

      const sentMessage = document.getElementById("sentMessage");
      sentMessage.textContent = `Enviamos um código de verificação para ${
        dados.destino || valor
      }. Ele expira em ${dados.expiracaoMinutos || 15} minutos.`;

      if (dados.codigoDemo) {
        sentMessage.textContent += ` Código de demonstração: ${dados.codigoDemo}.`;
      }
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });

  const sentOk = document.getElementById("sentOk");

  if (sentOk) {
    sentOk.addEventListener("click", () => {
      window.location.href = "codigo.html";
    });
  }
}

// ==============================
// CÓDIGO DE RECUPERAÇÃO
// ==============================

function configurarCodigo() {
  const resetForm = document.getElementById("resetForm");

  if (!resetForm) return;

  const identificador = localStorage.getItem(RESET_IDENTIFICADOR_KEY);
  const destino = localStorage.getItem(RESET_DESTINO_KEY) || identificador;
  const feedback = document.getElementById("resetFeedback");
  const resetEmailLabel = document.getElementById("resetEmailLabel");

  if (resetEmailLabel && destino) resetEmailLabel.textContent = destino;

  const codigoDemo = sessionStorage.getItem(RESET_DEMO_KEY);
  const inputCodigo = document.getElementById("resetCode");

  if (codigoDemo && inputCodigo) {
    inputCodigo.value = codigoDemo;
    showFeedback(feedback, `Código de demonstração preenchido: ${codigoDemo}.`);
  }

  if (!identificador) {
    showFeedback(
      feedback,
      "Nenhuma recuperação em andamento. Volte e informe sua conta."
    );
  }

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const codigo = inputCodigo.value.trim();

    if (!identificador) {
      showFeedback(feedback, "Solicite um novo código de recuperação.");
      return;
    }

    if (codigo.length < 4) {
      showFeedback(feedback, "Digite o código enviado.");
      return;
    }

    const botao = resetForm.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      await apiFetch("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ identificador, codigo }),
      });

      sessionStorage.setItem(
        RESET_KEY,
        JSON.stringify({ identificador, codigo })
      );

      window.location.href = "nova-senha.html";
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });
}

// ==============================
// NOVA SENHA (fluxo de recuperação)
// ==============================

function configurarNovaSenha() {
  const form = document.getElementById("novaSenhaForm");

  if (!form) return;

  const feedback = document.getElementById("editPasswordFeedback");
  const label = document.getElementById("novaSenhaEmailLabel");
  const destino = localStorage.getItem(RESET_DESTINO_KEY);

  if (label && destino) label.textContent = destino;

  let dadosReset = null;

  try {
    dadosReset = JSON.parse(sessionStorage.getItem(RESET_KEY) || "null");
  } catch (e) {
    dadosReset = null;
  }

  if (!dadosReset) {
    showFeedback(
      feedback,
      "Solicite um novo código de recuperação. Redirecionando..."
    );

    setTimeout(() => {
      window.location.href = "esqueci-senha.html";
    }, 2000);

    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novaSenha = document.getElementById("newPassword").value;
    const confirmar = document.getElementById("confirmNewPassword").value;

    if (!isStrongPassword(novaSenha)) {
      showFeedback(
        feedback,
        "A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo."
      );
      return;
    }

    if (novaSenha !== confirmar) {
      showFeedback(feedback, "As novas senhas não coincidem.");
      return;
    }

    const botao = form.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      await apiFetch("/auth/reset", {
        method: "POST",
        body: JSON.stringify({
          identificador: dadosReset.identificador,
          codigo: dadosReset.codigo,
          novaSenha,
        }),
      });

      sessionStorage.removeItem(RESET_KEY);
      sessionStorage.removeItem(RESET_DEMO_KEY);
      localStorage.removeItem(RESET_IDENTIFICADOR_KEY);
      localStorage.removeItem(RESET_DESTINO_KEY);

      showFeedback(
        feedback,
        "Senha redefinida com sucesso! Redirecionando para o login..."
      );

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });
}

// ==============================
// EDITAR INFORMAÇÕES
// ==============================

function configurarEdicaoPerfil(sessao) {
  const editInfoForm = document.getElementById("editInfoForm");

  if (!editInfoForm || !sessao) return;

  document.getElementById("editName").value = sessao.nome || "";
  document.getElementById("editEmail").value = sessao.email || "";
  document.getElementById("editPhone").value = sessao.telefone || "";

  const editCulturaEl = document.getElementById("editCultura");
  if (editCulturaEl) editCulturaEl.value = sessao.cultura || "";

  editInfoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const telefone = document.getElementById("editPhone").value.trim();
    const cultura = editCulturaEl ? editCulturaEl.value : undefined;
    const feedback = document.getElementById("editInfoFeedback");

    if (!nome) {
      showFeedback(feedback, "Preencha o nome.");
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback(feedback, "Digite um e-mail válido.");
      return;
    }

    if (telefone && !isValidPhone(telefone)) {
      showFeedback(feedback, "Digite um telefone válido com DDD.");
      return;
    }

    const botao = editInfoForm.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      const { usuario } = await apiFetch("/profile", {
        method: "PATCH",
        body: JSON.stringify({ nome, email, telefone, cultura }),
      });

      salvarSessaoLocal(usuario);

      const navUserName = document.getElementById("navUserName");
      if (navUserName) navUserName.textContent = usuario.nome;

      let msg = "Informações atualizadas com sucesso!";
      if (usuario.cultura) {
        msg += ` Você receberá notificações sobre: ${usuario.cultura}.`;
      }

      showFeedback(feedback, msg);

      setTimeout(() => {
        window.location.href = "perfil.html";
      }, 1500);
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });
}

// ==============================
// TROCAR SENHA (logado)
// ==============================

function configurarTrocaSenha(sessao) {
  const editPasswordForm = document.getElementById("editPasswordForm");

  if (!editPasswordForm || !sessao) return;

  editPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentPasswordEl = document.getElementById("currentPassword");
    const senhaAtual = currentPasswordEl ? currentPasswordEl.value : "";
    const novaSenha = document.getElementById("newPassword").value;
    const confirmar = document.getElementById("confirmNewPassword").value;
    const feedback = document.getElementById("editPasswordFeedback");

    if (!senhaAtual) {
      showFeedback(feedback, "Informe sua senha atual.");
      return;
    }

    if (!isStrongPassword(novaSenha)) {
      showFeedback(
        feedback,
        "A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo."
      );
      return;
    }

    if (novaSenha !== confirmar) {
      showFeedback(feedback, "As novas senhas não coincidem.");
      return;
    }

    const botao = editPasswordForm.querySelector('button[type="submit"]');
    setCarregando(botao, true);

    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      showFeedback(feedback, "Senha atualizada com sucesso!");

      setTimeout(() => {
        window.location.href = "perfil.html";
      }, 1500);
    } catch (err) {
      showFeedback(feedback, err.message);
    } finally {
      setCarregando(botao, false);
    }
  });
}

// ==============================
// PÁGINA DE PERFIL
// ==============================

function configurarPerfil(sessao) {
  const profileName = document.getElementById("profileName");

  if (!profileName) return;

  if (!sessao) {
    window.location.href = "login.html";
    return;
  }

  profileName.textContent = sessao.nome || sessao.name || "Perfil";

  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail) profileEmail.textContent = sessao.email || "—";

  const profilePhone = document.getElementById("profilePhone");
  if (profilePhone) profilePhone.textContent = sessao.telefone || "—";

  const profileCultura = document.getElementById("profileCultura");
  if (profileCultura) profileCultura.textContent = sessao.cultura || "—";

  const profileCreatedAt = document.getElementById("profileCreatedAt");

  if (profileCreatedAt) {
    profileCreatedAt.textContent = sessao.criado_em
      ? new Date(sessao.criado_em).toLocaleDateString("pt-BR")
      : "—";
  }
}

// ==============================
// INICIALIZAÇÃO
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  configurarTema();
  configurarOlhinhos();
  configurarMedidorSenha();
  configurarAvatar();

  const sessao = await carregarSessao();

  configurarHeader(sessao);

  if (!sessao) {
    const paginasProtegidas = ["perfil", "editar", "trocar", "historicos"];

    if (paginasProtegidas.includes(document.body.dataset.page)) {
      window.location.href = "login.html";
      return;
    }
  }

  configurarCadastro();
  configurarLogin();
  configurarRecuperacao();
  configurarCodigo();
  configurarNovaSenha();
  configurarEdicaoPerfil(sessao);
  configurarTrocaSenha(sessao);
  configurarPerfil(sessao);
});
