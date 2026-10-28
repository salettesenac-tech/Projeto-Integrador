export async function buscarUsuarioCompleto(sql, usuarioId) {
  const [usuario] = await sql`
    SELECT u.id,
           u.nome,
           u.email,
           u.telefone,
           u.avatar_url,
           u.criado_em,
           r.nome AS regiao,
           (
             SELECT c.nome
             FROM usuario_cultura uc
             JOIN cultura c ON c.id = uc.cultura_id
             WHERE uc.usuario_id = u.id
             ORDER BY c.nome
             LIMIT 1
           ) AS cultura
    FROM usuario u
    LEFT JOIN regiao r ON r.id = u.regiao_id
    WHERE u.id = ${usuarioId}
      AND u.ativo
    LIMIT 1
  `;

  return usuario ?? null;
}
