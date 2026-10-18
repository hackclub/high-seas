import { MATCHUPS_CLOSED_MESSAGE } from '@/lib/event-status'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ error: MATCHUPS_CLOSED_MESSAGE }, { status: 410 })
}
