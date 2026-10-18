/// <reference types="bun" />
import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const storedCookies = new Map<string, string>()
const cookieStore = {
  get: (name: string) => {
    const value = storedCookies.get(name)
    return value === undefined ? undefined : { name, value }
  },
  set: mock((name: string, value: string, _options?: unknown) => {
    storedCookies.set(name, value)
  }),
  delete: (name: string) => storedCookies.delete(name),
}

mock.module('next/headers', () => ({
  cookies: async () => cookieStore,
  headers: async () => new Headers(),
}))
mock.module('../src/app/utils/server/airtable', () => ({
  getSelfPerson: mock(() => Promise.resolve(null)),
  getPersonByMagicToken: mock(() => Promise.resolve(null)),
}))

const { getSession, deleteSession } = await import('../src/app/utils/auth')
const { signAndSet, sessionCookieName } = await import('../src/app/utils/server/auth')
const previousSecret = process.env.AUTH_SECRET
process.env.AUTH_SECRET = 'local-migration-test-secret'

afterAll(() => {
  if (previousSecret === undefined) delete process.env.AUTH_SECRET
  else process.env.AUTH_SECRET = previousSecret
})

beforeEach(() => {
  storedCookies.clear()
  cookieStore.set.mockClear()
})

describe('async session cookies', () => {
  test('signs, stores, and verifies a session through the async cookie API', async () => {
    const session = {
      personId: 'recTest',
      slackId: 'U12345678',
      email: 'test@example.com',
      authType: 'slack-oauth' as const,
    }
    await signAndSet(session)
    expect(await getSession()).toEqual(session)
    expect(cookieStore.set).toHaveBeenCalledWith(
      sessionCookieName,
      JSON.stringify(session),
      expect.objectContaining({ httpOnly: true, maxAge: 604800 }),
    )
  })

  test('rejects a tampered signed session', async () => {
    await signAndSet({
      personId: 'recTest',
      slackId: 'U12345678',
      email: 'test@example.com',
      authType: 'slack-oauth',
    })
    const session = JSON.parse(storedCookies.get(sessionCookieName)!)
    session.slackId = 'U87654321'
    storedCookies.set(sessionCookieName, JSON.stringify(session))
    expect(await getSession()).toBeNull()
  })

  test('returns no session when the cookie is absent', async () => {
    expect(await getSession()).toBeNull()
  })

  test('signout deletes the session and cached account cookies', async () => {
    const accountCookies = [
      sessionCookieName,
      'academy-completed',
      'ships',
      'signpost-feed',
      'tickets',
      'verification',
      'waka',
    ]
    for (const name of accountCookies) storedCookies.set(name, 'test')
    storedCookies.set('unrelated', 'keep')
    await deleteSession()
    for (const name of accountCookies) expect(storedCookies.has(name)).toBe(false)
    expect(storedCookies.get('unrelated')).toBe('keep')
  })
})
