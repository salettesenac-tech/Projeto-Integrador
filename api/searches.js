import { sql } from "./_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "./_lib/http.js";
import { getSessionUser } from "./_lib/session.js";

export default wrap(async (req, res) => {
  const usuario = await getSessionUser(sql, req);

  if (!usuario) {
    return res.status(401).json({
      error: "Entre na sua conta para salvar e consultar o histórico.",
    });
  }

  if (req.method === "GET") {
    const pesquisas = await sql`
      SELECT termo, encontrada, palavra, regioes, criado_em
      FROM vw_historico_pesquisas
      WHERE usuario_id = ${usuario.id}
      ORDER BY criado_em DESC
      LIMIT 30
    `;

    return res.status(200).json({ pesquisas });
  }

  if (req.method === "POST") {
    const termo = texto(corpo(req).termo, 120);

    if (!termo) {
      return res.status(400).json({ error: "Termo obrigatório." });
    }

    await sql`
      INSERT INTO pesquisa (usuario_id, termo, palavra_id)
      VALUES (
        ${usuario.id},
        ${termo},
        (
          SELECT id
          FROM palavra
          WHERE termo_normalizado = fn_normalizar_termo(${termo})
            AND ativo
          LIMIT 1
        )
      )
    `;

    return res.status(201).json({ ok: true });
  }

  return methodNotAllowed(res, ["GET", "POST"]);
});
