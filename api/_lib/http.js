/**
 * Utilitários comuns das funções serverless.
 */

export function wrap(fn) {
  return async function handler(req, res) {
    try {
      await fn(req, res);
    } catch (err) {
      console.error("[api]", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro interno no servidor." });
      }
    }
  };
}

export function methodNotAllowed(res, methods) {
  res.setHeader("Allow", methods.join(", "));
  return res.status(405).json({ error: "Método não permitido." });
}

export function corpo(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function texto(valor, max = 500) {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

export function ipDoCliente(req) {
  const bruto = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(bruto) ? bruto : null;
}
