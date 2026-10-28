import { sql } from "../_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "../_lib/http.js";
import {
  buscarUsuarioPorIdentificador,
  validarCodigo,
} from "../_lib/reset.js";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const body = corpo(req);
  const identificador = texto(body.identificador, 160);
  const codigo = texto(body.codigo, 6);

  if (!identificador || codigo.length < 4) {
    return res.status(400).json({ error: "Informe o código recebido." });
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

  return res.status(200).json({ ok: true, identificador });
});
