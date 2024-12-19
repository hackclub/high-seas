'use server'

import { getSession } from '@/app/utils/auth'
import { Ship } from '@/app/utils/data'

export async function sendFraudReport(
  project: Ship,
  type: string,
  reason: string,
) {
  const session = await getSession()

  const res = await fetch(
    'https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/flagged_projects',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              project: [project.id],
              reporter: [session?.personId],
              reason: type,
              details: reason,
            },
          },
        ],
      }),
    },
  )
    .then((data) => data.json())
    .then(console.log)

  console.log(project, type, reason)
}
