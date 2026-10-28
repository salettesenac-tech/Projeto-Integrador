import { sql } from "./_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "./_lib/http.js";
import { getSessionUser } from "./_lib/session.js";
import { buscarUsuarioCompleto } from "./_lib/usuario.js";
import {
  emailValido,
  normalizarTelefone,
} from "./_lib/validation.js";

export default wrap(async (req, res) => {
  const sessao = await getSessionUser(sql, req);

  if (!sessao) {
    return res.status(401).json({ error: "Entre para acessar seu perfil." });
  }

  if (req.method === "GET") {
    const usuario = await buscarUsuarioCompleto(sql, sessao.id);
    return res.status(200).json({ usuario });
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const body = corpo(req);
    const nome = texto(body.nome, 120);
    const email = texto(body.email, 160).toLowerCase();
    const telefone = normalizarTelefone(body.telefone);
    const cultura = texto(body.cultura, 120);

    if (nome.length < 2) {
      return res.status(400).json({ error: "Informe seu nome completo." });
    }

    if (!emailValido(email)) {
      return res.status(400).json({ error: "Digite um e-mail válido." });
    }

    if (telefone && (telefone.length < 10 || telefone.length > 13)) {
      return res
        .status(400)
        .json({ error: "Digite um telefone válido com DDD." });
    }

    try {
      await sql`
        UPDATE usuario
           SET nome = ${nome},
               email = ${email},
               telefone = ${telefone || null}
         WHERE id = ${sessao.id}
      `;
    } catch (err) {
      if (err.code === "23505") {
        return res
          .status(409)
          .json({ error: "E-mail ou telefone já cadastrado." });
      }
      throw err;
    }

    if (body.cultura !== undefined) {
      await sql`
        DELETE FROM usuario_cultura
         WHERE usuario_id = ${sessao.id}
      `;

      if (cultura) {
        await sql`
          INSERT INTO usuario_cultura (usuario_id, cultura_id)
          SELECT ${sessao.id}, id
          FROM cultura
          WHERE nome = ${cultura}
          ON CONFLICT DO NOTHING
        `;
      }
    }

    const usuario = await buscarUsuarioCompleto(sql, sessao.id);
    return res.status(200).json({ usuario });
  }

  return methodNotAllowed(res, ["GET", "PATCH"]);
});
