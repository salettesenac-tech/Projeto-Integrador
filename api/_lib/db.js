import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL não configurada. Defina a variável de ambiente com a connection string do PostgreSQL."
  );
}

export const sql = neon(connectionString);
