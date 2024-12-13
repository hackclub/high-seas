'use server'

import { cookies, headers } from 'next/headers'
import { getPersonByMagicToken, getSelfPerson } from './airtable'

export interface HsSession {
  /// The Person record ID in the high seas base
  personId: string

  authType: 'slack-oauth' | 'magic-link' | 'impersonation'
  slackId: string
  name?: string
  firstName?: string
  lastName?: string
  givenName?: string
  email: string
  picture?: string
  sig?: string
}

const sessionCookieName = 'hs-session'

function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

async function hashSession(session: HsSession) {
  const str = [
    session.personId,
    session.authType,
    session.slackId,
    session.name || '',
    session.firstName || '',
    session.lastName || '',
    session.givenName || '',
    session.email,
    session.picture || '',
  ].join('|')

  const authSecret = process.env.AUTH_SECRET
  if (!authSecret) throw new Error('Env AUTH_SECRET is not set')

  // Convert string and key to Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const keyData = encoder.encode(authSecret)

  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  // Generate HMAC
  const hashBuffer = await crypto.subtle.sign('HMAC', key, data)

  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hashHex
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

async function signAndSet(session: HsSession) {
  session.sig = await hashSession(session)

  cookies().set(sessionCookieName, JSON.stringify(session), {
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function verifySession(
  session: HsSession,
): Promise<HsSession | null> {
  const hashCheck = await hashSession(session)

  if (session.sig === hashCheck) {
    return session
  } else {
    return null
  }
}

export async function createSlackSession(slackOpenidToken: string) {
  try {
    const payload = parseJwt(slackOpenidToken)

    if (!payload) throw new Error('Failed to decode the Slack OpenId JWT')

    let person = (await getSelfPerson(payload.sub as string)) as any

    if (!person) {
      const body = JSON.stringify({
        performUpsert: {
          fieldsToMergeOn: ['email'],
        },
        records: [
          {
            fields: {
              email: payload.email,
              slack_id: payload.sub,
            },
          },
        ],
      })

      // Let's create a Person record
      const result = await fetch(
        'https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/people',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'highseas.hackclub.com (createPersonRecord)',
          },
          body,
        },
      ).then((d) => d.json())

      console.error('MAXSIGNINTEST', {
        payload,
        payloadSub: payload.sub,
        body,
        atApiKey: process.env.AIRTABLE_API_KEY,
        result,
      })

      person = result.records[0]
    }

    if (!person)
      throw new Error(
        "Couldn't find OR create a person! :(( Sad face. Tell malted that Airtable broke",
      )

    const sessionData: HsSession = {
      personId: person.id,
      authType: 'slack-oauth',
      slackId: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      givenName: payload.given_name as string,
      picture: payload.picture as string,
    }

    await signAndSet(sessionData)
  } catch (error) {
    console.error('Error creating Slack session:', error)
    throw error
  }
}

export async function createMagicSession(magicCode: string) {
  try {
    const partialPersonData = await getPersonByMagicToken(magicCode)
    if (!partialPersonData)
      throw new Error(`Failed to look up Person by magic code: ${magicCode}`)

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

export async function getRedirectUri(): Promise<string> {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const proto = headersList.get('x-forwarded-proto') || 'http'
  const uri = encodeURIComponent(`${proto}://${host}/api/slack_redirect`)

  return uri
}
