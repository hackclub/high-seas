'use server'

import { getPersonByAuto } from '@/app/utils/server/airtable'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest, props: { params: Promise<{ autonum: string }> }) {
  const params = await props.params
  const slackId = (await getPersonByAuto(params.autonum))?.slackId
  console.log({ autonum: params.autonum, slackId })
  if (slackId) {
    redirect('/?ref=' + slackId)
  } else {
    redirect('/')
  }
}
