import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { impersonate } from '@/app/utils/auth'

export async function GET(_request: NextRequest, props: { params: Promise<{ slackId: string }> }) {
  const params = await props.params
  if (process.env.NODE_ENV === 'development') {
    await impersonate(params.slackId)
  }

  redirect('/signpost')
}
