import 'server-only'

import { getSession } from './auth'
import { fetchWaka } from './data'

const WAKA_API_KEY = process.env.WAKA_API_KEY
export interface WakaSignupResponse {
  created: boolean
  api_key: string
}

// Deprecated??
export interface WakaInfo {
  username: string
  key: string
}

// Good function
export async function createWaka(
  email: string,
  name: string | null | undefined,
  slackId: string | null | undefined,
): Promise<WakaInfo> {
  const password = crypto.randomUUID()

  const payload = {
    location: 'America/New_York',
    email,
    password,
    password_repeat: password,
    name: name ?? 'Unkown',
    username:
      slackId ?? `$high-seas-provisional-${email.replace('+', '$plus$')}`,
  }

  const signup = await fetch('https://waka.hackclub.com/signup', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WAKA_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload),
  })

  let signupResponse: WakaSignupResponse
  try {
    signupResponse = await signup.json()
  } catch (e) {
    console.error(e)
    throw e
  }

  const { created, api_key } = signupResponse

  const username = payload.username

  return { username, key: api_key }
}

export async function getWakaSessions(interval?: string): Promise<{
  projects: { key: string; total: number }[]
}> {
  const session = await getSession()
  if (!session) throw new Error('No session found')
  const slackId = session.slackId

  const { username, key } = await fetchWaka(session)

  if (!username || !key) {
    const err = new Error(
      'While getting sessions, no waka info could be found or created',
    )
    console.error(err)
    throw err
  }

  const summaryRes = await fetch(
    `https://waka.hackclub.com/api/summary?interval=${
      interval || 'high_seas'
    }&user=${slackId}&recompute=true`,
    {
      headers: {
        // Note, this should probably just be an admin token in the future.
        Authorization: `Bearer ${key}`,
      },
    },
  )

  let summaryResJson: { projects: { key: string; total: number }[] }
  try {
    summaryResJson = await summaryRes.json()
  } catch (e) {
    console.error(e)
    throw e
  }

  return summaryResJson
}
