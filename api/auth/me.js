import { sql } from "../_lib/db.js";
import { methodNotAllowed, wrap } from "../_lib/http.js";
import { getSessionUser } from "../_lib/session.js";
import { buscarUsuarioCompleto } from "../_lib/usuario.js";

export default wrap(async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const sessao = await getSessionUser(sql, req);

  if (!sessao) {
    return res.status(200).json({ usuario: null });
  }

  const usuario = await buscarUsuarioCompleto(sql, sessao.id);

  return res.status(200).json({ usuario });
});
