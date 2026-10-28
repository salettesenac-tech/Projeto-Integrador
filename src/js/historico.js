// ==============================
// Histórico do usuário (API)
// Abas: palavras pesquisadas e contribuições
// ==============================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function formatarData(valor) {
  return valor ? new Date(valor).toLocaleString("pt-BR") : "";
}

function statusBadge(status) {
  const mapa = {
    pendente: { texto: "Pendente", classe: "text-bg-warning" },
    aprovada: { texto: "Aprovada", classe: "text-bg-success" },
    rejeitada: { texto: "Rejeitada", classe: "text-bg-danger" },
  };

  const item = mapa[status] || {
    texto: status || "—",
    classe: "text-bg-secondary",
  };

  return `<span class="badge ${item.classe}">${escapeHtml(item.texto)}</span>`;
}

function renderizarPesquisas(pesquisas) {
  const searchList = document.getElementById("searchList");
  if (!searchList) return;

  if (!pesquisas.length) {
    searchList.innerHTML = `<div class="history-empty">Nenhuma palavra pesquisada ainda.</div>`;
    return;
  }

  searchList.innerHTML = pesquisas
    .map((s, idx) => {
      const data = formatarData(s.criado_em);
      const termo = escapeHtml(s.termo);
      const detalhe = s.encontrada
        ? `<p class="mb-1"><strong>Palavra encontrada:</strong> ${escapeHtml(
            s.palavra
          )} (${escapeHtml(s.regioes || "—")})</p>`
        : `<p class="mb-1"><strong>Resultado:</strong> palavra ainda não cadastrada</p>`;

      return `
        <div class="accordion-item mb-2">
          <h2 class="accordion-header" id="searchHead-${idx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#searchCol-${idx}" aria-expanded="false" aria-controls="searchCol-${idx}">
              <div class="w-100 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-search me-2"></i>${termo}</span>
                <small class="text-muted ms-3">${data}</small>
              </div>
            </button>
          </h2>
          <div id="searchCol-${idx}" class="accordion-collapse collapse" aria-labelledby="searchHead-${idx}">
            <div class="accordion-body">
              <p class="mb-1"><strong>Termo pesquisado:</strong> ${termo}</p>
              ${detalhe}
              <p class="mb-0"><strong>Data/hora:</strong> ${data}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderizarContribuicoes(contribuicoes) {
  const contributionList = document.getElementById("contributionList");
  if (!contributionList) return;

  if (!contribuicoes.length) {
    contributionList.innerHTML = `<div class="history-empty">Nenhuma contribuição ainda.</div>`;
    return;
  }

  contributionList.innerHTML = contribuicoes
    .map((c, idx) => {
      const data = formatarData(c.criado_em);
      const palavra = escapeHtml(c.termo);
      const regiao = escapeHtml(c.regiao || "Não informada");
      const significado = escapeHtml(c.significado);
      const contexto = c.contexto ? escapeHtml(c.contexto) : "";

      return `
        <div class="accordion-item mb-2">
          <h2 class="accordion-header" id="contribHead-${idx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#contribCol-${idx}" aria-expanded="false" aria-controls="contribCol-${idx}">
              <div class="w-100 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-pencil me-2"></i>${palavra}</span>
                <small class="text-muted ms-3">${data}</small>
              </div>
            </button>
          </h2>
          <div id="contribCol-${idx}" class="accordion-collapse collapse" aria-labelledby="contribHead-${idx}">
            <div class="accordion-body">
              <p class="mb-1"><strong>Palavra/expressão:</strong> ${palavra}</p>
              <p class="mb-1"><strong>Região:</strong> ${regiao}</p>
              <p class="mb-1"><strong>Significado:</strong> ${significado}</p>
              ${contexto ? `<p class="mb-1"><strong>Contexto:</strong> ${contexto}</p>` : ""}
              <p class="mb-1"><strong>Status:</strong> ${statusBadge(c.status)}</p>
              <p class="mb-0"><strong>Sugerida em:</strong> ${data}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  const searchList = document.getElementById("searchList");
  const contributionList = document.getElementById("contributionList");

  try {
    const [pesquisas, contribuicoes] = await Promise.all([
      apiFetch("/searches"),
      apiFetch("/contributions"),
    ]);

    renderizarPesquisas(pesquisas.pesquisas || []);
    renderizarContribuicoes(contribuicoes.contribuicoes || []);
  } catch (err) {
    const mensagem =
      err.status === 401
        ? "Entre na sua conta para ver o histórico."
        : err.message;

    if (searchList) {
      searchList.innerHTML = `<div class="history-empty">${escapeHtml(
        mensagem
      )}</div>`;
    }

    if (contributionList) {
      contributionList.innerHTML = `<div class="history-empty">${escapeHtml(
        mensagem
      )}</div>`;
    }
  }
});
