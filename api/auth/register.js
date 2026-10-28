import bcrypt from "bcryptjs";
import { sql } from "../_lib/db.js";
import { corpo, methodNotAllowed, texto, wrap } from "../_lib/http.js";
import {
  emailValido,
  normalizarTelefone,
  senhaForte,
} from "../_lib/validation.js";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const body = corpo(req);
  const nome = texto(body.nome, 120);
  const email = texto(body.email, 160).toLowerCase();
  const telefone = normalizarTelefone(body.telefone);
  const senha = body.senha;

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

  if (!senhaForte(senha)) {
    return res.status(400).json({
      error:
        "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.",
    });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const [usuario] = await sql`
      INSERT INTO usuario (nome, email, telefone, senha_hash)
      VALUES (${nome}, ${email}, ${telefone || null}, ${senhaHash})
      RETURNING id, nome, email
    `;

    return res.status(201).json({ usuario });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "E-mail ou telefone já cadastrado." });
    }
    throw err;
  }
});
