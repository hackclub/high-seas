import { sql } from '@vercel/postgres'

export default async function createBackgroundJob(
  type: 'run_lottery' | 'create_person' | 'invite',
  args: {},
  status: 'pending' | 'completed' | 'failed' = 'pending',
) {
  console.log(JSON.stringify(args))
  return await sql`INSERT INTO background_job (type, args, status) VALUES (${type}, ${JSON.stringify(args)}, ${status})`
}

export const fetchCache = 'force-no-store'
