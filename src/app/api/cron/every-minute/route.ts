import { updateProjectCache } from '../../battles/matchups/get-cached-projects'
import { processBackgroundJobs } from '../process-background-jobs'
import yswsUpdates from '../ysws-updates'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 59

export async function GET() {
  await Promise.all([
    processBackgroundJobs(),
    updateProjectCache(),
    yswsUpdates(),
  ])

  return Response.json({ success: true })
}
