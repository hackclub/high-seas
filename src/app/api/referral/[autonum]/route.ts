import 'server-only'

import { getPersonByAuto } from '@/app/utils/airtable'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { autonum: string } },
) {
  const slackId = (await getPersonByAuto(params.autonum))?.slackId
  console.log({ autonum: params.autonum, slackId })
  if (slackId) {
    redirect('/?ref=' + slackId)
  } else {
    redirect('/')
  }
}
