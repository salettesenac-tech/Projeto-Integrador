const searches = JSON.parse(localStorage.getItem("vivalingua_searches") || "[]");
const contributions = JSON.parse(localStorage.getItem("vivalingua_contributions") || "[]");

const searchList = document.getElementById("searchList");
if (searchList) {
  if (!searches.length) {
    searchList.innerHTML = `<div class="history-empty">Nenhuma palavra pesquisada ainda.</div>`;
  } else {
    searchList.innerHTML = searches
      .map((s, idx) => {
        const data = s.data ? new Date(s.data).toLocaleString("pt-BR") : "";
        const termo = escapeHtml(s.termo || "");
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
                <p class="mb-0"><strong>Data/hora:</strong> ${data}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

const contributionList = document.getElementById("contributionList");
if (contributionList) {
  if (!contributions.length) {
    contributionList.innerHTML = `<div class="history-empty">Nenhuma contribuição ainda.</div>`;
  } else {
    contributionList.innerHTML = contributions
      .map((c, idx) => {
        const data = c.data ? new Date(c.data).toLocaleString("pt-BR") : "";
        const palavra = escapeHtml(c.palavra || "");
        const regiao = escapeHtml(c.regiao || "");
        const significado = escapeHtml(c.significado || "");
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
                <p class="mb-0"><strong>Sugerida em:</strong> ${data}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById("currentYear").textContent = new Date().getFullYear();
