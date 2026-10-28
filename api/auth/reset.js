import bcrypt from "bcryptjs";
import { sql } from "../_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "../_lib/http.js";
import { senhaForte } from "../_lib/validation.js";
import {
  buscarUsuarioPorIdentificador,
  validarCodigo,
} from "../_lib/reset.js";
import { clearSessionCookie } from "../_lib/session.js";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const body = corpo(req);
  const identificador = texto(body.identificador, 160);
  const codigo = texto(body.codigo, 6);
  const novaSenha = body.novaSenha;

  if (!identificador || codigo.length < 4) {
    return res
      .status(400)
      .json({ error: "Solicite um novo código de recuperação." });
  }

  if (!senhaForte(novaSenha)) {
    return res.status(400).json({
      error:
        "A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.",
    });
  }

  const usuario = await buscarUsuarioPorIdentificador(sql, identificador);

  if (!usuario) {
    return res
      .status(404)
      .json({ error: "Conta não encontrada. Solicite um novo código." });
  }

  const resultado = await validarCodigo(sql, usuario.id, codigo);

  if (!resultado.ok) {
    return res.status(resultado.status).json({ error: resultado.error });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await sql`
    UPDATE usuario
       SET senha_hash = ${senhaHash},
           senha_alterada_em = now()
     WHERE id = ${usuario.id}
  `;

  await sql`
    UPDATE recuperacao_senha
       SET usado_em = now()
     WHERE id = ${resultado.registro.id}
  `;

  // Por segurança, encerra todas as sessões antigas depois da troca de senha.
  await sql`
    UPDATE sessao
       SET revogado_em = now()
     WHERE usuario_id = ${usuario.id}
       AND revogado_em IS NULL
  `;

  clearSessionCookie(res);

  return res.status(200).json({ ok: true });
});
