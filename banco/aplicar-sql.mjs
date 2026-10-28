/**
 * Aplica banco/01-schema.sql e banco/02-seed.sql no PostgreSQL.
 *
 * Uso:
 *   npm run db:setup
 *
 * A connection string é lida de DATABASE_URL (ou POSTGRES_URL).
 * Se elas não estiverem no ambiente, o script lê o arquivo .env da raiz.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@neondatabase/serverless";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function carregarEnv() {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) return;

  const arquivo = path.join(raiz, ".env");

  if (!fs.existsSync(arquivo)) return;

  for (const linha of fs.readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const limpa = linha.trim();

    if (!limpa || limpa.startsWith("#")) continue;

    const separador = limpa.indexOf("=");
    if (separador < 1) continue;

    const chave = limpa.slice(0, separador).trim();
    let valor = limpa.slice(separador + 1).trim();

    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}

async function main() {
  carregarEnv();

  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

  if (!connectionString) {
    console.error(
      "DATABASE_URL não encontrada. Crie um .env na raiz ou exporte a variável."
    );
    process.exit(1);
  }

  const arquivos = [
    "banco/01-schema.sql",
    "banco/02-seed.sql",
  ];

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const { rows } = await client.query(
      "select current_database() as banco, current_user as usuario"
    );

    console.log(
      `Conectado em ${rows[0].banco} como ${rows[0].usuario}.`
    );

    for (const relativo of arquivos) {
      const caminho = path.join(raiz, relativo);

      if (!fs.existsSync(caminho)) {
        throw new Error(`Arquivo não encontrado: ${relativo}`);
      }

      const conteudo = fs.readFileSync(caminho, "utf8");

      process.stdout.write(`Aplicando ${relativo}... `);
      await client.query(conteudo);
      console.log("ok");
    }

    const resumo = await client.query(`
      select
        (select count(*) from regiao)::int as regioes,
        (select count(*) from cultura)::int as culturas,
        (select count(*) from palavra)::int as palavras,
        (select count(*) from palavra_regiao)::int as associacoes,
        (select count(*) from usuario)::int as usuarios
    `);

    console.log("Resumo:", resumo.rows[0]);

    const views = await client.query(`
      select table_name
        from information_schema.views
       where table_schema = 'public'
         and table_name in ('vw_historico_pesquisas', 'vw_historico_contribuicoes')
       order by table_name
    `);

    console.log(
      "Views:",
      views.rows.map((r) => r.table_name).join(", ") || "nenhuma"
    );
    console.log("Banco pronto.");
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error("Falhou:", err.message);
  process.exit(1);
});
