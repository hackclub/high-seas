import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { impersonate } from '@/app/utils/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slackId: string } },
) {
  if (process.env.NODE_ENV === 'development') {
    await impersonate(params.slackId)
  }

  redirect('/signpost')
}
