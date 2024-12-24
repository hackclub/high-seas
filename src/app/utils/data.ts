'use server'

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

import { getSession, type HsSession } from './auth'
import { createWaka } from './waka'
import { cookies } from 'next/headers'

//#region Ships
export type ShipType = 'project' | 'update'
export type ShipStatus = 'shipped' | 'staged' | 'deleted'
export type YswsType =
  | 'none'
  | 'onboard'
  | 'blot'
  | 'sprig'
  | 'bin'
  | 'hackpad'
  | 'llm'
  | 'boba'
  | 'cascade'
  | 'retrospect'
  | 'hackcraft'
  | 'cider'
  | 'browser buddy'
  | 'cargo-cult'
  | 'fraps'
  | 'riceathon'
  | 'counterspell'
  | 'anchor'
  | 'dessert'
  | 'asylum'

export interface Ship extends EditableShipFields {
  id: string // The Airtable row's ID.
  autonumber: number
  // doubloonsPaid?: number;
  matchups_count: number
  hours: number | null
  credited_hours: number | null
  total_hours: number | null
  voteRequirementMet: boolean
  voteBalanceExceedsRequirement: boolean
  doubloonPayout: number
  shipType: ShipType
  shipStatus: ShipStatus
  wakatimeProjectNames: string[]
  createdTime: string
  updateDescription: string | null
  reshippedFromId: string | null
  reshippedToId: string | null
  reshippedAll: string[] | null
  reshippedFromAll: string[] | null
  paidOut: boolean
  yswsType: YswsType
  feedback: string | null
}
export interface EditableShipFields {
  title: string
  repoUrl: string
  deploymentUrl?: string
  readmeUrl: string
  screenshotUrl: string
}

export async function fetchShips(
  slackId: string,
  maxRecords: null | number = null,
): Promise<Ship[]> {
  const realSlackId = await getSession().then((d) => d?.slackId)

  if (!realSlackId || realSlackId !== slackId) return []

  const filterFormula = `AND(
    TRUE(),
    '${slackId}' = {entrant__slack_id},
    {project_source} = 'high_seas',
    {ship_status} != 'deleted'
  )`

  let url = `https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/ships?filterByFormula=${encodeURIComponent(
    filterFormula,
  )}`
  if (maxRecords != null) url += `&maxRecords=${maxRecords}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'highseas.hackclub.com (fetchShips)',
    },
  }).then((data) => data.json())

  return res.records.map((r: { fields: any; id: string }) => {
    const reshippedToIdRaw = r.fields.reshipped_to as [string] | null
    const reshippedToId = reshippedToIdRaw ? reshippedToIdRaw[0] : null

    const reshippedFromIdRaw = r.fields.reshipped_from as [string] | null
    const reshippedFromId = reshippedFromIdRaw ? reshippedFromIdRaw[0] : null
    const reshippedAll = r.fields.reshipped_all as [string] | null
    const reshippedFromAll = r.fields.reshipped_from_all as [string] | null

    const wakatimeProjectNameRaw = r.fields.wakatime_project_name as
      | string
      | null
    const wakatimeProjectNames = wakatimeProjectNameRaw
      ? wakatimeProjectNameRaw.split('$$xXseparatorXx$$')
      : []

    const ship: Ship = {
      id: r.id,
      autonumber: parseInt(r.fields.autonumber),
      title: r.fields.title,
      repoUrl: r.fields.repo_url,
      deploymentUrl: r.fields.deploy_url,
      readmeUrl: r.fields.readme_url,
      screenshotUrl: r.fields.screenshot_url,
      voteRequirementMet: Boolean(r.fields.vote_requirement_met),
      voteBalanceExceedsRequirement: Boolean(
        r.fields.vote_balance_exceeds_requirement,
      ),
      matchups_count: r.fields.matchups_count,
      doubloonPayout: r.fields.doubloon_payout,
      shipType: r.fields.ship_type,
      shipStatus: r.fields.ship_status,
      wakatimeProjectNames,
      hours: r.fields.hours,
      credited_hours: r.fields.credited_hours,
      total_hours: r.fields.total_hours,
      createdTime: r.fields.created_time,
      updateDescription: r.fields.update_description,
      reshippedFromId,
      reshippedToId,
      reshippedAll,
      reshippedFromAll,
      paidOut: Boolean(r.fields.paid_out),
      yswsType: r.fields.yswsType,
      feedback: r.fields.ai_feedback_summary,
    }

    return ship
  })
}
//#endregion

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
    `https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/people/${session.personId}`,
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
    'https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/signpost',
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
    'https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/shop_items',
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

//#region Best ships
const bestShipsCacheTtl = 60_000
let bestShipsTs = 0
type BestShip = {
  title: string
  repoUrl: string
  deployUrl: string
  screenshotUrl: string
  payout: number
}
let bestShipsCache: BestShip[] | undefined

export async function getBestShips(): Promise<BestShip[]> {
  const session = await getSession()
  if (!session) throw new Error('No session present')

  if (bestShipsCache) {
    const expired = Date.now() > bestShipsTs + bestShipsCacheTtl
    if (!expired) {
      console.log('Best ships HIT')
      return bestShipsCache
    }
  }

  console.log('Best ships MISS')

  const recordPromise = await fetch(
    'https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/tblHeGZNG00d4GBBV?limit=3&view=viwHvRRLCwPMOmRhj',
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'highseas.hackclub.com (best ships)',
      },
    },
  ).then((r) => r.json())

  const sanitised = recordPromise.records.map(
    ({ fields }: { fields: any }) => ({
      title: fields.title,
      repoUrl: fields.repo_url,
      deployUrl: fields.deploy_url,
      screenshotUrl: fields.screenshot_url,
      payout: fields.doubloon_payout,
      entrantSlackId: fields.entrant__slack_id[0],
    }),
  )

  bestShipsCache = sanitised
  bestShipsTs = Date.now()

  return sanitised
}
//#endregion
