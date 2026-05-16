import { createClient } from "@neondatabase/serverless"

const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("Missing NEON_DATABASE_URL environment variable")
}

export const db = createClient({ connectionString })

let schemaInitialized = false

async function ensureSchema() {
  if (schemaInitialized) return

  await db.sql`
    CREATE TABLE IF NOT EXISTS app_store (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`

  await db.sql`
    CREATE TABLE IF NOT EXISTS route_notes (
      id text PRIMARY KEY,
      route_id text NOT NULL,
      type text NOT NULL,
      text text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`

  schemaInitialized = true
}

export async function getStoreValue<T = unknown>(key: string, fallback: T): Promise<T> {
  await ensureSchema()
  const result = await db.sql`SELECT value FROM app_store WHERE key = ${key}`
  const row = result.rows?.[0]
  if (!row) return fallback
  return row.value as T
}

export async function setStoreValue(key: string, value: unknown): Promise<void> {
  await ensureSchema()
  await db.sql`
    INSERT INTO app_store (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = now()`
}
