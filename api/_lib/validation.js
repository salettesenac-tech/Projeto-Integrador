export function normalizarTelefone(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function emailValido(valor) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
    String(valor || "")
  );
}

export function senhaForte(senha) {
  return (
    typeof senha === "string" &&
    senha.length >= 8 &&
    /[A-Z]/.test(senha) &&
    /[a-z]/.test(senha) &&
    /[0-9]/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}
