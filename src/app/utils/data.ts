'use server'

import { getSession } from './auth'

/* Functions exported from this module will be exposed
 * as HTTP endpoints. Dragons be here.
 */

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
  | 'hackapet'
  | 'constellation'
  | 'raspi-api'
  | 'say-cheese'

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
  isInYswsBase: boolean
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
      isInYswsBase: Boolean(r.fields.entrant__ysws_submission),
    }

    return ship
  })
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
