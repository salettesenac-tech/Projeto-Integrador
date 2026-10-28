import { sql } from "../_lib/db.js";
import { corpo, ipDoCliente, methodNotAllowed, texto, wrap } from "../_lib/http.js";
import {
  CODIGO_VALIDADE_MINUTOS,
  buscarUsuarioPorIdentificador,
  gerarCodigo,
  hashCodigo,
  mascararDestino,
} from "../_lib/reset.js";

async function enviarEmail(para, codigo) {
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "VivaLingua <onboarding@resend.dev>",
      to: [para],
      subject: "Seu código de recuperação — VivaLíngua",
      html: `
        <p>Recebemos um pedido para redefinir a senha da sua conta VivaLíngua.</p>
        <p>Seu código é <strong style="font-size:24px;letter-spacing:4px">${codigo}</strong>.</p>
        <p>Ele expira em ${CODIGO_VALIDADE_MINUTOS} minutos. Se não foi você, ignore este e-mail.</p>
      `,
    }),
  });

  if (!resposta.ok) {
    console.error("[resend]", await resposta.text());
    return false;
  }

  return true;
}

export default wrap(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const identificador = texto(corpo(req).identificador, 160);

  if (!identificador) {
    return res.status(400).json({ error: "Informe e-mail ou telefone." });
  }

  const usuario = await buscarUsuarioPorIdentificador(sql, identificador);

  if (!usuario) {
    return res
      .status(404)
      .json({ error: "Conta não encontrada com esses dados." });
  }

  const canal =
    usuario.email && (!usuario.telefone || identificador.includes("@"))
      ? "email"
      : "sms";

  const destinoReal = canal === "email" ? usuario.email : usuario.telefone;
  const destino = mascararDestino(destinoReal);
  const codigo = gerarCodigo();

  await sql`
    UPDATE recuperacao_senha
       SET usado_em = now()
     WHERE usuario_id = ${usuario.id}
       AND usado_em IS NULL
  `;

  await sql`
    INSERT INTO recuperacao_senha
      (usuario_id, canal, destino, codigo_hash, expira_em, ip, user_agent)
    VALUES (
      ${usuario.id},
      ${canal}::recuperacao_canal,
      ${destino},
      ${hashCodigo(codigo)},
      now() + interval '15 minutes',
      ${ipDoCliente(req)},
      ${(req.headers["user-agent"] || "").slice(0, 500) || null}
    )
  `;

  let enviado = false;

  if (canal === "email" && process.env.RESEND_API_KEY) {
    enviado = await enviarEmail(destinoReal, codigo);
  }

  if (!enviado) {
    console.log(`[recuperacao] código de ${usuario.email}: ${codigo}`);
  }

  const resposta = {
    ok: true,
    canal,
    destino,
    expiracaoMinutos: CODIGO_VALIDADE_MINUTOS,
  };

  if (!enviado && process.env.DEMO_MOSTRAR_CODIGO === "true") {
    resposta.codigoDemo = codigo;
  }

  return res.status(200).json(resposta);
});
