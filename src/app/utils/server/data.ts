import 'server-only'

/* @malted says:
 * Hi! Welcome to `data.ts` :)
 * These are critical functions primarily used by `middleware.ts`.
 *
 * If you need the user's ships for example, you should not be here.
 * You should instead use the cookie, which is set by `middleware.ts`.
 *
 * Do not use any libraries here.
 * This module is imported into the Vercel edge runtime
 * You've been warned.
 */

import { getSession, type HsSession } from '../auth'
import { createWaka } from '../waka'

//#region Person
const personCacheTtl = 60_000
const personCache = new Map<
  string,
  { recordPromise: Promise<any>; timestamp: number }
>()

export async function person(): Promise<any> {
  const session = await getSession()
  if (!session) throw new Error('No session present')

  const personCached = personCache.get(session.personId)
  if (personCached) {
    const expired = Date.now() > personCached.timestamp + personCacheTtl
    let rejected = false
    personCached.recordPromise.catch(() => (rejected = true))
    if (!expired && !rejected) {
      console.log('Person cache HIT')
      return personCached.recordPromise
    }
  }
  console.log('Person cache MISS')

  const recordPromise = fetch(
    `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/people/${session.personId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'highseas.hackclub.com (person)',
      },
    },
  ).then((r) => r.json())

  personCache.set(session.personId, {
    recordPromise,
    timestamp: Date.now(),
  })

  recordPromise.catch(() => personCache.delete(session.personId))

  return recordPromise
}

export async function updateShowInLeaderboard(
  showInLeaderboard: boolean,
): Promise<void> {
  const session = await getSession()
  if (!session) throw new Error('No session present')

  const cached = personCache.get(session.personId)
  if (cached) {
    const record = await cached.recordPromise
    record.fields.show_in_leaderboard = showInLeaderboard

    // Update the cache.
    personCache.set(session.personId, {
      recordPromise: Promise.resolve(record),
      timestamp: record.timestamp,
    })
  }
}
//#endregion

//#region Wakatime
export async function hasHbData(username: string): Promise<boolean> {
  const res = await fetch(
    `https://waka.hackclub.com/api/special/hasData/?user=${encodeURIComponent(
      username,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WAKA_API_KEY}`,
        accept: 'application/json',
      },
    },
  ).then((res) => res.json())

  return res.hasData
}
export async function fetchWaka(session: HsSession): Promise<{
  username: string
  key: string
  hasHb: boolean
}> {
  const { slack_id, email, full_name, preexisting_user } = await person()
    .then((p) => p.fields)
    .catch(console.error)

  const { username, key } = await createWaka(
    email,
    preexisting_user
      ? full_name
      : (session.name?.length ?? 0) > 0
        ? session.name
        : null,
    preexisting_user
      ? slack_id
      : session.slackId.length > 0
        ? session.slackId
        : null,
  )

  const hasHb = await hasHbData(username)

  return { username, key, hasHb }
}
//#endregion

//#region Signpost
export interface SignpostFeedItem {
  id: string
  createdTime: Date
  title: string
  autonumber: number
  link: string
}
export async function fetchSignpostFeed(): Promise<SignpostFeedItem[]> {
  const result = await fetch(
    `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/signpost`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'User-Agent': 'highseas.hackclub.com (fetchSignpostFeed)',
      },
    },
  ).then((d) => d.json())

  const records = result.records

  //TODO: Pagination.
  return records
    .filter((r: { fields: { visible: boolean } }) => r.fields.visible === true)
    .map(
      (r: {
        id: string
        createdTime: string
        fields: {
          title: string
          autonumber: number
          link: string
        }
      }) => ({
        id: r.id,
        createdTime: new Date(r.createdTime),
        title: r.fields.title,
        autonumber: Number(r.fields.autonumber),
        link: r.fields.link,
      }),
    )
}
//#endregion

//#region Shop
export interface ShopItem {
  id: string
  name: string
  subtitle: string | null
  imageUrl: string | null
  enabledUs: boolean
  enabledEu: boolean
  enabledIn: boolean
  enabledXx: boolean
  enabledCa: boolean
  priceUs: number
  priceGlobal: number
  fulfilledAtEnd: boolean
  comingSoon: boolean
  outOfStock: boolean
  minimumHoursEstimated: number
  maximumHoursEstimated: number
}
export async function fetchShopItems(): Promise<ShopItem[]> {
  const result = await fetch(
    `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/shop_items`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'User-Agent': 'highseas.hackclub.com (fetchShopItems)',
      },
    },
  ).then((d) => d.json())

  //TODO: Pagination.
  return result.records
    .filter((r: { fields: { enabled: boolean } }) => r.fields.enabled === true)
    .map(({ id, fields }: any) => ({
      id,
      name: fields.name,
      subtitle: fields.subtitle,
      imageUrl: fields.image_url,
      enabledUs: fields.enabled_us === true,
      enabledEu: fields.enabled_eu === true,
      enabledIn: fields.enabled_in === true,
      enabledXx: fields.enabled_xx === true,
      enabledCa: fields.enabled_ca === true,
      priceUs: fields.tickets_us,
      priceGlobal: fields.tickets_global,
      fulfilledAtEnd: fields.fulfilled_at_end === true,
      comingSoon: fields.coming_soon === true,
      outOfStock: fields.out_of_stock === true,
      minimumHoursEstimated: fields.minimum_hours_estimated,
      maximumHoursEstimated: fields.maximum_hours_estimated,
    }))
}
//#endregion
