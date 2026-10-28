import crypto from "node:crypto";
import { ipDoCliente } from "./http.js";

const COOKIE = "vivalingua_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

export function getSessionToken(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)vivalingua_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function createSession(sql, usuarioId, req, res) {
  const token = crypto.randomBytes(32).toString("base64url");

  await sql`
    INSERT INTO sessao (usuario_id, token_hash, ip, user_agent, expira_em)
    VALUES (
      ${usuarioId},
      ${hashToken(token)},
      ${ipDoCliente(req)},
      ${(req.headers["user-agent"] || "").slice(0, 500) || null},
      now() + interval '30 days'
    )
  `;

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`
  );
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

export async function getSessionUser(sql, req) {
  const token = getSessionToken(req);
  if (!token) return null;

  const [usuario] = await sql`
    SELECT u.id, u.nome, u.email, u.telefone, u.avatar_url, u.criado_em
    FROM sessao s
    JOIN usuario u ON u.id = s.usuario_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.revogado_em IS NULL
      AND s.expira_em > now()
      AND u.ativo
    LIMIT 1
  `;

  return usuario ?? null;
}

export async function revokeCurrentSession(sql, req) {
  const token = getSessionToken(req);
  if (!token) return;

  await sql`
    UPDATE sessao
       SET revogado_em = now()
     WHERE token_hash = ${hashToken(token)}
       AND revogado_em IS NULL
  `;
}

export async function revokeOtherSessions(sql, usuarioId, req) {
  const token = getSessionToken(req);
  const atual = token ? hashToken(token) : null;

  await sql`
    UPDATE sessao
       SET revogado_em = now()
     WHERE usuario_id = ${usuarioId}
       AND revogado_em IS NULL
       AND (${atual}::text IS NULL OR token_hash <> ${atual})
  `;
}
