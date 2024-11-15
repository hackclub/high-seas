import { getSelfPerson } from '@/app/utils/airtable'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { HsSession, signAndSet } from '@/app/utils/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slackId: string } },
) {
  if (process.env.NODE_ENV === 'development') {
    // only allow impersonation in development while testing
    const { slackId } = params
    // look for airtable user with this record
    const person = await getSelfPerson(slackId)
    const id = person.id
    const email = person.fields.email

    const session: HsSession = {
      personId: id,
      authType: 'impersonation',
      slackId,
      email,
    }

    await signAndSet(session)
  }

  redirect('/signpost')
}
