'use server'
/* Functions exported from this module will be exposed
 * as HTTP endpoints. Dragons be here.
 */

import { cookies } from 'next/headers'
import { getPersonByMagicToken } from './server/airtable'
import { getSelfPerson } from './server/airtable'
import {
  HsSession,
  sessionCookieName,
  signAndSet,
  verifySession,
} from './server/auth'

export async function getSession(): Promise<HsSession | null> {
  try {
    const sessionCookie = cookies().get(sessionCookieName)
    if (!sessionCookie) return null

    const unsafeSession = JSON.parse(sessionCookie.value)
    return verifySession(unsafeSession)
  } catch (error) {
    console.error('Error verifying session:', error)
    return null
  }
}

export async function deleteSession() {
  const cookieKeys =
    'academy-completed ships signpost-feed tickets verification waka'
      .split(' ')
      .forEach((key) => cookies().delete(key))
  cookies().delete(sessionCookieName)
}

export async function createMagicSession(magicCode: string) {
  try {
    const partialPersonData = await getPersonByMagicToken(magicCode)
    if (!partialPersonData)
      throw new Error('High Seas has ended! Sign-ups are disabled.')

    const { id, email, slackId } = partialPersonData

    console.log('SOTNRESTNSREINTS', { id, email, slackId })

    const session: HsSession = {
      personId: id,
      authType: 'magic-link',
      slackId,
      email,
    }

    await signAndSet(session)
  } catch (error) {
    console.error('Error creating Magic session:', error)
    throw error
  }
}

export async function impersonate(slackId: string) {
  // only allow impersonation in development while testing
  if (process.env.NODE_ENV !== 'development') {
    return
  }

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
