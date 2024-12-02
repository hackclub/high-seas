import { updateProjectCache } from '../../battles/matchups/get-cached-projects'
import { processBackgroundJobs } from '../process-background-jobs'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  await Promise.all([processBackgroundJobs(), updateProjectCache()])

  return Response.json({ success: true })
}
