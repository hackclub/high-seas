import 'server-only'

import { neon } from '@neondatabase/serverless'

// Initialize on first query so builds do not require database credentials.
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL
  if (!connectionString) throw new Error('Set POSTGRES_URL or DATABASE_URL')
  return neon(connectionString, { fullResults: true })(strings, ...values)
}
