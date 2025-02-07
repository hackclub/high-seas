'use server'

import { sql } from '@vercel/postgres'
import { withLock } from '../../../../lib/redis-lock'

async function processPendingInviteJobs() {
  const { rows } =
    await sql`SELECT * FROM background_job WHERE type = 'invite' AND status = 'pending' LIMIT 10`

  if (rows.length === 0) {
    return
  }

  console.log(`Processing ${rows.length} invite jobs`)

  const fields = rows.map((row) => ({
    fields: {
      Email: row.args.email,
      'Form Submission IP': row.args.ipAddress,
      'User Agent': row.args.userAgent,
    },
  }))

  const { records } = await fetch(
    'https://middleman.hackclub.com/airtable/v0/appaqcJtn33vb59Au/High Seas',
    {
      cache: 'no-cache',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: fields }),
    },
  ).then((r) => r.json())

  // update the status of the jobs
  await Promise.all(
    records.map(async (record) => {
      return await sql`
    UPDATE background_job
    SET status='completed',
      output=${JSON.stringify(record)}
      WHERE args->>'email' = ${record.fields.Email}
      AND type='invite'
      AND status='pending'`
    }),
  )
}

async function processPendingPersonInitJobs() {
  const { rows } = await sql`
  SELECT DISTINCT ON (args->>'email')
    args->>'email' AS email,
    args->>'ipAddress' AS ip_address,
    args->>'isMobile' AS is_mobile,
    args->>'username' AS username,
    args->>'urlParams' AS url_params
  FROM background_job
  WHERE type = 'create_person'
  AND status = 'pending'
  ORDER BY args->>'email', created_at DESC
  LIMIT 10;
  `

  if (rows.length === 0) {
    await fetch(
      'https://kuma-hackclub.fly.dev/api/push/HAPogoJ2s1?status=up&msg=OK&ping=',
    )
    return
  }

  const fields = rows.map((row) => ({
    fields: {
      email: row.email,
      ip_address: row.ip_address,
      email_submitted_on_mobile: Boolean(row.is_mobile),
      arrpheus_ready_to_invite: true,
      invite_url_params: row.url_params,
    },
  }))

  console.log('Creating person with', JSON.stringify(fields, null, 2))
  const upsertBody = {
    records: fields,
    performUpsert: {
      fieldsToMergeOn: ['email'],
    },
  }
  console.log(JSON.stringify(upsertBody, null, 2))
  const result = await fetch(
    'https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/tblfTzYVqvDJlIYUB',
    {
      cache: 'no-cache',
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: fields,
        performUpsert: {
          fieldsToMergeOn: ['email'],
        },
      }),
    },
  )
    .then((r) => r.json())
    .catch(console.error)

  const records = result?.records || []
  console.log('Person created', records)

  await Promise.all(
    records.map(async (record) => {
      return await sql`
    UPDATE background_job
    SET status='completed',
      output=${JSON.stringify(record)}
      WHERE args->>'email' = ${record.fields.email}
      AND type='create_person'
      AND status='pending'`
    }),
  )

  await fetch(
    'https://kuma-hackclub.fly.dev/api/push/HAPogoJ2s1?status=up&msg=OK&ping=',
  )
}

async function processPendingVotingJobs() {
  await withLock('create-vote-records', async () => {
    console.log('Searching for pending voting jobs')
    const { rows } = await sql`
SELECT DISTINCT ON (args->>'voteSignature') *
FROM background_job
WHERE type = 'submit_vote' AND status = 'pending'
ORDER BY args->>'voteSignature', id DESC
LIMIT 3;
  `

    if (rows.length === 0) {
      return
    }

    console.log(`Processing ${rows.length} voting jobs`)

    const fields = rows.map((r) => ({
      fields: {
        ...r.args.recordToCreate,
        signature: r.args.voteSignature,
      },
    }))

    const resultText = await fetch(
      'https://api.airtable.com/v0/appTeNFYcUiYfGcR6/battles',
      {
        method: 'PATCH',
        headers: {
          'User-Agent': 'highseas.hackclub.com (processPendingVotingJobs)',
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: fields,
          performUpsert: {
            fieldsToMergeOn: ['signature'],
          },
        }),
      },
    ).then((r) => r.text())

    const result = JSON.parse(resultText)
    if (result.error) {
      console.error('Error submitting votes:', result.error)
      return
    }

    // update the status of the jobs
    await Promise.all(
      result.records.map(async (record) => {
        console.log('Marking', record.fields['signature'], 'as completed')
        return await sql`
    UPDATE background_job
    SET status='completed',
      output=${JSON.stringify(record)}
      WHERE type='submit_vote'
      AND args->>'voteSignature' = ${record.fields['signature']}
      AND status='pending'`
      }),
    )
  })
}

export async function processBackgroundJobs() {
  await Promise.all([
    processPendingInviteJobs(),
    processPendingPersonInitJobs(),
    // processPendingVotingJobs(),
  ])
}
