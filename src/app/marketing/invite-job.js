import 'server-only'

import { sql } from '@vercel/postgres'
import { headers } from 'next/headers'

export async function sendInviteJob({ email, userAgent }) {
  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for')

  const _result =
    await sql`INSERT INTO invite_job (email, ip_address, user_agent) VALUES (${email}, ${ipAddress}, ${userAgent});`

  // return result;
}

export async function processPendingInviteJobs() {
  const { rows } =
    await sql`SELECT * FROM invite_job WHERE airtable_invite_record_id IS NULL LIMIT 10`

  if (rows.length === 0) {
    return
  }

  console.log(
    `Processing ${rows.length} pending invite jobs for ${rows.map((row) => row.email).join(', ')}`,
  )

  const fields = rows.map((row) => ({
    fields: {
      Email: row.email,
      'Form Submission IP': row.ip_address,
      'User Agent': row.user_agent,
    },
  }))

  console.log(
    `Creating ${fields.length} records in Airtable for ${fields.map((field) => field.fields.Email).join(', ')}`,
  )

  const createdRecords = await fetch(
    'https://middleman.hackclub.com/airtable/v0/appaqcJtn33vb59Au/High Seas',
    {
      cache: 'no-cache',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'highseas.hackclub.com (processPendingInviteJobs)',
      },
      body: JSON.stringify({ records: fields }),
    },
  ).then((r) => r.json())

  console.log(
    `Created ${createdRecords.records.length} records in Airtable for ${createdRecords.records.map((record) => record.fields.Email).join(', ')}`,
  )

  for (const record of createdRecords.records) {
    const { id, fields } = record
    const email = fields['Email']
    await sql`UPDATE invite_job SET airtable_invite_record_id = ${id} WHERE email = ${email} AND airtable_invite_record_id IS NULL;`
  }
}
