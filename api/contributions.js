import { sql } from "./_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "./_lib/http.js";
import { getSessionUser } from "./_lib/session.js";

export default wrap(async (req, res) => {
  const usuario = await getSessionUser(sql, req);

  if (req.method === "GET") {
    if (!usuario) {
      return res.status(401).json({
        error: "Entre na sua conta para consultar suas contribuições.",
      });
    }

    const contribuicoes = await sql`
      SELECT termo, regiao, significado, contexto, status, criado_em
      FROM vw_historico_contribuicoes
      WHERE usuario_id = ${usuario.id}
      ORDER BY criado_em DESC
      LIMIT 50
    `;

    return res.status(200).json({ contribuicoes });
  }

  if (req.method === "POST") {
    const body = corpo(req);
    const termo = texto(body.termo, 80);
    const regiao = texto(body.regiao, 40) || null;
    const significado = texto(body.significado, 2000);
    const contexto = texto(body.contexto, 2000) || null;

    if (termo.length < 2) {
      return res
        .status(400)
        .json({ error: "Informe a palavra ou expressão (mínimo 2 caracteres)." });
    }

    if (!significado) {
      return res.status(400).json({ error: "Informe o significado." });
    }

    const [contribuicao] = await sql`
      INSERT INTO contribuicao
        (usuario_id, termo, regiao_id, significado, contexto)
      VALUES (
        ${usuario?.id ?? null},
        ${termo},
        (SELECT id FROM regiao WHERE nome = ${regiao}),
        ${significado},
        ${contexto}
      )
      RETURNING id, status, criado_em
    `;

    return res.status(201).json({ contribuicao });
  }

  return methodNotAllowed(res, ["GET", "POST"]);
});
