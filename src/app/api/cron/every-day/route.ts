export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import 'server-only'
import Airtable from 'airtable'

async function triggerShirtJob() {
  Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY,
    endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
  })

  const base = Airtable.base(process.env.BASE_ID)
  console.log('Getting people to regenerate')
  const peopleToRegenerate = await base('people')
    .select({
      filterByFormula: `
    AND(
      NOT({action_generate_shirt_design} = TRUE()),
      NOT({ysws_submission} = BLANK())
    )`,
      fields: [],
    })
    .all()

  const peopleIds = peopleToRegenerate.map((person) => person.id)
  console.log('People to regenerate:', peopleIds.length)
  const chunkSize = 10
  for (let i = 0; i < peopleIds.length; i += chunkSize) {
    console.log(`Processing chunk ${i} to ${i + chunkSize}`)
    const chunk = peopleIds.slice(i, i + chunkSize)
    await base('people').update(
      chunk.map((id) => ({
        id,
        fields: {
          action_generate_shirt_design: true,
        },
      })),
    )
  }
}

async function processDailyJobs() {
  console.log('Processing daily jobs')
  // await triggerShirtJob()
}

export async function GET() {
  await processDailyJobs()
  return Response.json({ success: true })
}
