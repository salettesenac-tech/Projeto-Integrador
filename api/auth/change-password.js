import bcrypt from "bcryptjs";
import { sql } from "../_lib/db.js";
import { corpo, methodNotAllowed, wrap } from "../_lib/http.js";
import {
  getSessionUser,
  revokeOtherSessions,
} from "../_lib/session.js";
import { senhaForte } from "../_lib/validation.js";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const usuario = await getSessionUser(sql, req);

  if (!usuario) {
    return res.status(401).json({ error: "Entre para alterar sua senha." });
  }

  const body = corpo(req);
  const senhaAtual = String(body.senhaAtual ?? "");
  const novaSenha = body.novaSenha;

  if (!senhaAtual || !novaSenha) {
    return res
      .status(400)
      .json({ error: "Informe a senha atual e a nova senha." });
  }

  if (!senhaForte(novaSenha)) {
    return res.status(400).json({
      error:
        "A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.",
    });
  }

  const [registro] = await sql`
    SELECT senha_hash
    FROM usuario
    WHERE id = ${usuario.id}
    LIMIT 1
  `;

  if (!registro || !(await bcrypt.compare(senhaAtual, registro.senha_hash))) {
    return res.status(400).json({ error: "A senha atual está incorreta." });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await sql`
    UPDATE usuario
       SET senha_hash = ${senhaHash},
           senha_alterada_em = now()
     WHERE id = ${usuario.id}
  `;

  await revokeOtherSessions(sql, usuario.id, req);

  return res.status(200).json({ ok: true });
});
