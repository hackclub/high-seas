import { MATCHUPS_CLOSED_MESSAGE } from '@/lib/event-status'

export const dynamic = 'force-dynamic'

export function POST() {
  return Response.json({ error: MATCHUPS_CLOSED_MESSAGE }, { status: 410 })
}
