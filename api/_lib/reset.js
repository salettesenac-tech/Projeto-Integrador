import crypto from "node:crypto";
import { normalizarTelefone } from "./validation.js";

const SEGREDO = process.env.AUTH_SECRET || "vivalingua-segredo-local";
const VALIDADE_MINUTOS = 15;
const MAX_TENTATIVAS = 5;

export function gerarCodigo() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashCodigo(codigo) {
  return crypto
    .createHmac("sha256", SEGREDO)
    .update(String(codigo))
    .digest("hex");
}

function codigoConfere(codigo, hashEsperado) {
  const recebido = Buffer.from(hashCodigo(codigo), "hex");
  const esperado = Buffer.from(String(hashEsperado || ""), "hex");

  return (
    recebido.length === esperado.length &&
    crypto.timingSafeEqual(recebido, esperado)
  );
}

export function mascararDestino(valor) {
  const texto = String(valor || "");

  if (texto.includes("@")) {
    const [nome, dominio] = texto.split("@");
    return `${nome.slice(0, 1)}${"*".repeat(Math.max(nome.length - 1, 2))}@${dominio}`;
  }

  const digitos = normalizarTelefone(texto);
  return `+** *****-**${digitos.slice(-2)}`;
}

export async function buscarUsuarioPorIdentificador(sql, identificador) {
  const valor = String(identificador || "").trim();
  const digitos = normalizarTelefone(valor);

  const [usuario] = await sql`
    SELECT id, nome, email, telefone
    FROM usuario
    WHERE ativo
      AND (
        lower(email) = lower(${valor})
        OR telefone = ${digitos.length >= 10 ? digitos : null}
      )
    LIMIT 1
  `;

  return usuario ?? null;
}

export async function buscarCodigoAtivo(sql, usuarioId) {
  const [registro] = await sql`
    SELECT id, codigo_hash, tentativas
    FROM recuperacao_senha
    WHERE usuario_id = ${usuarioId}
      AND usado_em IS NULL
      AND expira_em > now()
    ORDER BY criado_em DESC
    LIMIT 1
  `;

  return registro ?? null;
}

export async function validarCodigo(sql, usuarioId, codigo) {
  const registro = await buscarCodigoAtivo(sql, usuarioId);

  if (!registro) {
    return {
      ok: false,
      status: 400,
      error: "Código expirado ou inexistente. Solicite um novo.",
    };
  }

  if (registro.tentativas >= MAX_TENTATIVAS) {
    return {
      ok: false,
      status: 429,
      error: "Muitas tentativas. Solicite um novo código.",
    };
  }

  if (!codigoConfere(codigo, registro.codigo_hash)) {
    await sql`
      UPDATE recuperacao_senha
         SET tentativas = tentativas + 1
       WHERE id = ${registro.id}
    `;

    return { ok: false, status: 400, error: "Código incorreto." };
  }

  return { ok: true, registro };
}

export const CODIGO_VALIDADE_MINUTOS = VALIDADE_MINUTOS;
