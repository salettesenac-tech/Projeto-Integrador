// ==============================
// Cliente da API (Vercel Functions)
// ==============================

async function apiFetch(path, options = {}) {
  const config = {
    method: options.method || "GET",
    credentials: "same-origin",
    ...options,
  };

  if (options.body !== undefined) {
    config.headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
  }

  const resposta = await fetch(`/api${path}`, config);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(
      dados.error || "Não foi possível concluir a solicitação."
    );
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}
