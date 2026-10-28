import bcrypt from "bcryptjs";
import { sql } from "../_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "../_lib/http.js";
import { createSession } from "../_lib/session.js";
import { normalizarTelefone } from "../_lib/validation.js";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const body = corpo(req);
  const identificador = texto(body.identificador ?? body.email, 160);
  const senha = String(body.senha ?? body.password ?? "");
  const digitos = normalizarTelefone(identificador);

  if (!identificador || !senha) {
    return res
      .status(400)
      .json({ error: "Preencha e-mail e senha para continuar." });
  }

  const [usuario] = await sql`
    SELECT id, nome, email, senha_hash
    FROM usuario
    WHERE ativo
      AND (
        lower(email) = lower(${identificador})
        OR telefone = ${digitos.length >= 10 ? digitos : null}
      )
    LIMIT 1
  `;

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }

  await sql`
    UPDATE usuario
       SET ultimo_login_em = now()
     WHERE id = ${usuario.id}
  `;

  await createSession(sql, usuario.id, req, res);

  return res.status(200).json({
    usuario: { nome: usuario.nome, email: usuario.email },
  });
});
