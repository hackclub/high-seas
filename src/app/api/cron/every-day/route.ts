export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import createBackgroundJob from '../create-background-job'

async function processDailyJobs() {
  console.log('Processing daily jobs')
}

export async function GET() {
  await processDailyJobs()
  return Response.json({ success: true })
}
