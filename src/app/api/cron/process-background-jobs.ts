'use server'

import { sql } from '@vercel/postgres'
import Airtable from 'airtable'

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
}

async function processLotteryJobs() {
  const { rows } = await sql`
  SELECT *
  FROM background_job
  WHERE type = 'run_lottery'
  AND status = 'pending'
  LIMIT 1;
  `

  if (rows.length === 0) {
    return
  }

  const previous = (
    await sql`
  SELECT *
  FROM background_job
  WHERE type = 'run_lottery'
  AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;`
  ).rows[0]

  console.log('Previous lottery job', previous)

  if (
    previous &&
    previous.created_at > new Date(Date.now() - 1000 * 60 * 60 * 23)
  ) {
    return
  }

  Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY,
    endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
  })

  const base = Airtable.base('appTeNFYcUiYfGcR6')

  const highSeasChannelId = 'C07PZMBUNDS'
  await base('arrpheus_message_requests').create({
    message_text: `Each day, a newly signed up user will win a free Raspberry Pi Zero! Today's winner is...`,
    target_slack_id: highSeasChannelId,
    requester_identifier: 'cron-job',
  })

  // read all free sticker orders created in the last 24 hours
  const eligibleUsers = await base('people')
    .select({
      filterByFormula: `AND(
      has_ordered_free_stickers = TRUE(),
      verified_eligible = TRUE(),
      verified_ineligible = FALSE(),
      DATETIME_DIFF(NOW(), verification_updated_at, 'hours') <= 24
    )`,
    })
    .all()

  const winner = eligibleUsers.sort(() => Math.random() - 0.5)[0]
  console.log('Winner', winner)

  // create the order
  const order = await base('shop_orders').create({
    status: 'fresh',
    shop_item: ['recKV56D2PATOqK4W'],
    recipient: [winner?.id],
  })

  // send a DM to the winner
  const messageRequests = [
    {
      message_text: `Hey, congrats <@${winner?.fields['slack_id']}>! You won today's free Raspberry Pi Zero! 🎉 We're shipping it to the same address as your sticker bundle.`,
      target_slack_id: winner?.fields['slack_id'],
      requester_identifier: 'cron-job',
    },
    {
      message_text: `Heads up, <@${winner?.fields['slack_id']}> won today's Raspberry Pi Zero! 🎉`,
      target_slack_id: 'U0C7B14Q3', // notify msw for observability
      requester_identifier: 'cron-job',
    },
    {
      message_text: `Congratulations to <@${winner?.fields['slack_id']}> for winning a free Raspberry Pi Zero! 🎉 Every day a newly signed up person will get one.`,
      target_slack_id: highSeasChannelId,
      requester_identifier: 'cron-job',
    },
  ]

  const messagePromise = base('arrpheus_message_requests').create(
    messageRequests.map((m) => ({ fields: m })),
  )

  const upsert = await sql`
  UPDATE background_job
  SET status='completed',
    output=${JSON.stringify(order)}
    WHERE type='run_lottery'
    AND status='pending'`

  await Promise.all([upsert, messagePromise])
}
export async function processBackgroundJobs() {
  await Promise.all([
    processPendingInviteJobs(),
    processPendingPersonInitJobs(),
    processLotteryJobs(),
  ])
}
