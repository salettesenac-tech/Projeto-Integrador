// ==============================
// Autenticação (demonstração)
// Usuários e sessão via localStorage
// ==============================

const USERS_KEY = "vivalingua_users";
const SESSION_KEY = "vivalingua_session";

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function showFeedback(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("d-none");
}

function normalizePhone(phone) {
    return (phone || "").replace(/\D/g, "");
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

    // Formato básico: usuario@dominio.tld
    const formatOk = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

    if (!formatOk) return false;


    const domain = email.split("@")[1];


    // O domínio precisa ter pelo menos um ponto e terminar com uma extensão válida
    if (!domain.includes(".")) return false;


    const tld = domain.split(".").pop().toLowerCase();


    const validTlds = [
        "com", "com.br", "br", "net", "org", "gov", "edu", "io", "dev",
        "info", "biz", "co", "me", "tv", "app", "online"
    ];


    const hasValidTld = validTlds.some((t) => domain.toLowerCase().endsWith("." + t) || domain.toLowerCase() === t);


    return hasValidTld;

}

document.addEventListener("DOMContentLoaded", () => {

    // Ano no rodapé
    const currentYear = document.getElementById("currentYear");
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // ==============================
    // CADASTRO
    // ==============================
    const cadastroForm = document.getElementById("cadastroForm");

    if (cadastroForm) {

        cadastroForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const name = document.getElementById("cadastroName").value.trim();
            const regionEl = document.getElementById("cadastroRegion");
            const region = regionEl ? regionEl.value : "";
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

            if (password.length < 6) {
                showFeedback(feedback, "A senha deve ter pelo menos 6 caracteres.");
                return;
            }

            if (!isStrongPassword(password)) {
                showFeedback(feedback, "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.");
                return;
            }

            if (password !== confirm) {
                showFeedback(feedback, "As senhas não coincidem.");
                return;
            }

            const users = getUsers();

            if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
                showFeedback(feedback, "Este e-mail já está cadastrado.");
                return;
            }

            if (phone && users.some((user) => normalizePhone(user.phone) === normalizePhone(phone))) {
                showFeedback(feedback, "Este telefone já está cadastrado.");
                return;
            }

            users.push({ name, region, email, phone, password, createdAt: new Date().toISOString() });
            saveUsers(users);

            showFeedback(feedback, "Conta criada com sucesso! Redirecionando...");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        });

    }

    // ==============================
    // LOGIN
    // ==============================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            const feedback = document.getElementById("loginFeedback");

            if (!email || !password) {
                showFeedback(feedback, "Preencha e-mail e senha para continuar.");
                return;
            }

            if (!isValidEmail(email) && !isValidPhone(email)) {
                showFeedback(feedback, "Digite um e-mail ou telefone válido.");
                return;
            }

            const users = getUsers();

            const user = users.find(
                (u) => (u.email.toLowerCase() === email.toLowerCase() || (u.phone && normalizePhone(u.phone) === normalizePhone(email) && normalizePhone(email).length >= 10)) && u.password === password
            );

            if (!user) {
                showFeedback(feedback, "E-mail ou senha incorretos.");
                return;
            }

            localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));

            showFeedback(feedback, "Login realizado com sucesso! Redirecionando...");

            setTimeout(() => {
                window.location.href = "../../index.html";
            }, 1500);

        });

    }


    // ==============================
    // AVATAR PERSONALIZADO
    // ==============================
    const avatarInput = document.getElementById("avatarInput");

    const changeAvatarBtn = document.getElementById("changeAvatarBtn");

    const profileAvatar = document.getElementById("profileAvatar");

    const profileAvatarIcon = document.getElementById("profileAvatarIcon");


    if (avatarInput && changeAvatarBtn && profileAvatar) {

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
    // TEMA CLARO / ESCURO
    // ==============================
    const themeToggle = document.getElementById("themeToggle");

    const themeIcon = document.getElementById("themeIcon");

    const themeLabel = document.getElementById("themeLabel");


    function applyTheme(theme) {

        if (theme === "dark") {

            document.body.classList.add("dark");

            if (themeIcon) themeIcon.className = "bi bi-moon-fill";

            if (themeLabel) themeLabel.textContent = "Modo escuro";

        } else {

            document.body.classList.remove("dark");

            if (themeIcon) themeIcon.className = "bi bi-sun-fill";

            if (themeLabel) themeLabel.textContent = "Modo claro";

        }

    }


    applyTheme(localStorage.getItem("vivalingua_theme") || "light");


    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            const next = document.body.classList.contains("dark") ? "light" : "dark";

            localStorage.setItem("vivalingua_theme", next);

            applyTheme(next);

        });

    }


    // ==============================
    // OLHINHO DA SENHA
    // ==============================
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


    // ==============================
    // MEDIDOR DE FORÇA DA SENHA
    // ==============================
    const passwordInput = document.getElementById("cadastroPassword");

    const strengthBarFill = document.getElementById("strengthBarFill");

    const strengthText = document.getElementById("strengthText");


    if (passwordInput && strengthBarFill && strengthText) {

        passwordInput.addEventListener("input", () => {

            const value = passwordInput.value;



            const checks = [
                { ok: value.length >= 8, label: "caracteres" },
                { ok: /[A-Z]/.test(value), label: "maiúscula" },
                { ok: /[a-z]/.test(value), label: "minúscula" },
                { ok: /[0-9]/.test(value), label: "número" },
                { ok: /[^A-Za-z0-9]/.test(value), label: "símbolo" }
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

            strengthText.textContent = value.length === 0
                ? ""
                : (missing.length ? `Falta: ${missing.join(", ")}` : "Senha segura!");

        });

    }


    // ==============================
    // SESSÃO NO HEADER
    // ==============================
    let session = null;

    try {
        session = JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        session = null;
    }


    const navLogin = document.getElementById("navLogin");

    const navUser = document.getElementById("navUser");


    if (session && navLogin && navUser) {

        navLogin.classList.add("d-none");

        navUser.classList.remove("d-none");

        const navUserName = document.getElementById("navUserName");

        if (navUserName) {
            navUserName.textContent = session.name;
        }


        const savedAvatarNav = localStorage.getItem("vivalingua_avatar");

        const navUserAvatar = document.getElementById("navUserAvatar");

        const navUserIcon = document.getElementById("navUserIcon");


        if (savedAvatarNav && navUserAvatar) {

            navUserAvatar.src = savedAvatarNav;

            navUserAvatar.classList.remove("d-none");

            if (navUserIcon) navUserIcon.classList.add("d-none");

        }

    }


    if (!session && (document.body.dataset.page === "editar" || document.body.dataset.page === "perfil" || document.body.dataset.page === "trocar")) {

        window.location.href = "login.html";

    }


    const navLogout = document.getElementById("navLogout");

    if (navLogout) {

        navLogout.addEventListener("click", (event) => {

            event.preventDefault();

            localStorage.removeItem(SESSION_KEY);

            window.location.href = (document.body.dataset.page === "perfil" || document.body.dataset.page === "editar" || document.body.dataset.page === "trocar")
                ? "../../index.html"
                : "index.html";

        });

    }


    // ==============================
    // EDITAR INFORMAÇÕES
    // ==============================
    const editPasswordBtn = document.getElementById("editPasswordBtn");

    const editInfoForm = document.getElementById("editInfoForm");

    const editPasswordForm = document.getElementById("editPasswordForm");


    if (editInfoForm) {

        const usersNow = getUsers();

        const currentUser = session
            ? usersNow.find((u) => u.email.toLowerCase() === session.email.toLowerCase())
            : null;


        if (currentUser) {

            document.getElementById("editName").value = currentUser.name || "";

            const editRegionEl = document.getElementById("editRegion");

            if (editRegionEl) editRegionEl.value = currentUser.region || "";

            const editEmailEl = document.getElementById("editEmail");

            if (editEmailEl) editEmailEl.value = currentUser.email || "";

            document.getElementById("editPhone").value = currentUser.phone || "";

            const editCulturaEl = document.getElementById("editCultura");

            if (editCulturaEl) editCulturaEl.value = currentUser.cultura || "";

        }


        editInfoForm.addEventListener("submit", (event) => {

            event.preventDefault();


            const name = document.getElementById("editName").value.trim();

            const editRegionEl = document.getElementById("editRegion");

            const region = editRegionEl ? editRegionEl.value : undefined;

            const phone = document.getElementById("editPhone").value.trim();


            const editEmailEl = document.getElementById("editEmail");

            const email = editEmailEl ? editEmailEl.value.trim() : undefined;


            const editCulturaEl = document.getElementById("editCultura");

            const cultura = editCulturaEl ? editCulturaEl.value : undefined;


            const feedback = document.getElementById("editInfoFeedback");


            if (!name) {

                showFeedback(feedback, "Preencha o nome.");

                return;

            }


            if (email !== undefined && !isValidEmail(email)) {

                showFeedback(feedback, "Digite um e-mail válido.");

                return;

            }


            if (phone && !isValidPhone(phone)) {

                showFeedback(feedback, "Digite um telefone válido com DDD.");

                return;

            }


            const users = getUsers();

            const idx = users.findIndex((u) => u.email.toLowerCase() === session.email.toLowerCase());


            if (idx === -1) {

                showFeedback(feedback, "Usuário não encontrado.");

                return;

            }


            users[idx].name = name;

            if (editRegionEl) users[idx].region = region;

            users[idx].phone = phone;

            if (email !== undefined) users[idx].email = email;

            if (cultura !== undefined) users[idx].cultura = cultura;

            saveUsers(users);


            localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email: email !== undefined ? email : session.email }));


            const profileNameEl = document.getElementById("profileName");

            if (profileNameEl) profileNameEl.textContent = name;


            const profileRegionEl = document.getElementById("profileRegion");

            if (profileRegionEl && region) profileRegionEl.textContent = region;


            const profilePhoneEl = document.getElementById("profilePhone");

            if (profilePhoneEl) profilePhoneEl.textContent = phone || "—";


            const profileCulturaEl = document.getElementById("profileCultura");

            if (profileCulturaEl) profileCulturaEl.textContent = cultura || "—";


            const profileEmailEl = document.getElementById("profileEmail");

            if (profileEmailEl && email !== undefined) profileEmailEl.textContent = email;


            let msg = "Informações atualizadas com sucesso!";

            if (cultura) msg += ` Você receberá notificações sobre: ${cultura}.`;

            showFeedback(feedback, msg);


            setTimeout(() => {
                window.location.href = "perfil.html";
            }, 1500);

        });

    }


    // ==============================
    // TROCAR SENHA
    // ==============================
    if (editPasswordForm) {

        editPasswordForm.addEventListener("submit", (event) => {

            event.preventDefault();


            const currentPassword = document.getElementById("currentPassword").value;

            const newPassword = document.getElementById("newPassword").value;

            const confirmNew = document.getElementById("confirmNewPassword").value;


            const feedback = document.getElementById("editPasswordFeedback");


            const users = getUsers();

            const idx = users.findIndex((u) => u.email.toLowerCase() === session.email.toLowerCase());


            if (idx === -1) {

                showFeedback(feedback, "Usuário não encontrado.");

                return;

            }


            if (users[idx].password !== currentPassword) {

                showFeedback(feedback, "A senha atual está incorreta.");

                return;

            }


            if (!isStrongPassword(newPassword)) {

                showFeedback(feedback, "A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.");

                return;

            }


            if (newPassword !== confirmNew) {

                showFeedback(feedback, "As novas senhas não coincidem.");

                return;

            }


            users[idx].password = newPassword;

            saveUsers(users);

            showFeedback(feedback, "Senha atualizada com sucesso!");

            setTimeout(() => {
                window.location.href = "perfil.html";
            }, 1500);

        });

    }


    // ==============================
    // PÁGINA DE PERFIL
    // ==============================
    const profileName = document.getElementById("profileName");


    if (profileName) {

        if (!session) {

            window.location.href = "login.html";

            return;

        }


        const users = getUsers();

        const user = users.find(
            (u) => u.email.toLowerCase() === session.email.toLowerCase()
        );


        document.getElementById("profileName").textContent = user ? user.name : session.name;

        document.getElementById("profileEmail").textContent = session.email;

        document.getElementById("profileRegion").textContent = user ? user.region : "—";


        const profilePhone = document.getElementById("profilePhone");

        if (profilePhone) {

            profilePhone.textContent = user && user.phone ? user.phone : "—";

        }


        const profileCulturaEl = document.getElementById("profileCultura");

        if (profileCulturaEl) {

            profileCulturaEl.textContent = user && user.cultura ? user.cultura : "—";

        }


        const profileCreatedAt = document.getElementById("profileCreatedAt");

        if (profileCreatedAt) {

            if (user && !user.createdAt) {

                user.createdAt = new Date().toISOString();

                saveUsers(users);

            }


            profileCreatedAt.textContent = user && user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                : "—";

        }

    }

});
