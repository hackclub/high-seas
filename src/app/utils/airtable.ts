'use server'

import { getSession } from './auth'
import { person, updateShowInLeaderboard } from './data'

export const getSelfPerson = async (slackId: string) => {
  const url = `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/people`
  const filterByFormula = encodeURIComponent(`{slack_id} = '${slackId}'`)
  const response = await fetch(`${url}?filterByFormula=${filterByFormula}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'highseas.hackclub.com (getSelfPerson)',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.error(e, await response.text())
    throw e
  }
  return data.records[0]
}

export const getSignpostUpdates = async () => {
  const url = `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/signpost`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'highseas.hackclub.com (getSignpostUpdates)',
    },
  })

  if (!response.ok) {
    console.log(response)
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.error(e, await response.text())
    throw e
  }

  return data.records
}

export async function getPersonByAuto(num: string): Promise<{
  slackId: string
} | null> {
  const baseId = process.env.BASE_ID
  const apiKey = process.env.AIRTABLE_API_KEY
  const table = 'people'

  const url = `https://middleman.hackclub.com/airtable/v0/${baseId}/${table}?filterByFormula={autonumber}='${encodeURIComponent(num)}'`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'highseas.hackclub.com (getPersonByMagicToken)',
    },
  })

  if (!response.ok) {
    const err = new Error(`Airtable API error: ${await response.text()}`)
    console.error(err)
    throw err
  }

  const data = await response.json()
  if (!data.records || data.records.length === 0) return null

  const id = data.records[0].id
  const email = data.records[0].fields.email
  const slackId = data.records[0].fields.slack_id

  if (!id || !email || !slackId) return null

  return { slackId }
}

export async function getPersonByMagicToken(token: string): Promise<{
  id: string
  email: string
  slackId: string
} | null> {
  const baseId = process.env.BASE_ID
  const apiKey = process.env.AIRTABLE_API_KEY
  const table = 'people'

  const url = `https://middleman.hackclub.com/airtable/v0/${baseId}/${table}?filterByFormula={magic_auth_token}='${encodeURIComponent(token)}'`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'highseas.hackclub.com (getPersonByMagicToken)',
    },
  })

  if (!response.ok) {
    const err = new Error(`Airtable API error: ${await response.text()}`)
    console.error(err)
    throw err
  }

  const data = await response.json()
  if (!data.records || data.records.length === 0) return null

  const id = data.records[0].id
  const email = data.records[0].fields.email
  const slackId = data.records[0].fields.slack_id

  if (!id || !email || !slackId) return null

  return { id, email, slackId }
}

export async function getSelfPersonIdentifier(slackId: string) {
  const person = await getSelfPerson(slackId)
  return person.fields.identifier
}

export const getPersonTicketBalanceAndTutorialStatutWowThisMethodNameSureIsLongPhew =
  async (
    slackId: string,
  ): Promise<{ tickets: number; hasCompletedTutorial: boolean }> => {
    const person = await getSelfPerson(slackId)
    const tickets = person.fields.settled_tickets as number
    const hasCompletedTutorial = person.fields.academy_completed === true

    return { tickets, hasCompletedTutorial }
  }

// deprecate
export async function getVotesRemainingForNextPendingShip(slackId: string) {
  const person = await getSelfPerson(slackId)
  return person['fields']['votes_remaining_for_next_pending_ship'] as number
}

/// Person record info we can expose to the frontend
export interface SafePerson {
  id: string
  createdTime: Date
  settledTickets: number
  hasCompletedTutorial: boolean
  votesRemainingForNextPendingShip: number
  emailSubmittedOnMobile: boolean
  preexistingUser: boolean
  cursed: boolean
  blessed: boolean
  referralLink: string
}

// Good method
export async function safePerson(): Promise<SafePerson> {
  const record = await person()

  const id = record.id
  const createdTime = new Date(record.createdTime)
  const settledTickets = Number(record.fields.settled_tickets)
  const hasCompletedTutorial = !!record.fields.academy_completed
  const votesRemainingForNextPendingShip = parseInt(
    record.fields.votes_remaining_for_next_pending_ship,
  )
  const emailSubmittedOnMobile = !!record.fields.email_submitted_on_mobile
  const preexistingUser = !!record.fields.preexisting_user
  const cursed = record.fields.curse_blessing_status === 'cursed'
  const blessed = record.fields.curse_blessing_status === 'blessed'
  const referralLink = record.fields.referral_link

  return {
    id,
    createdTime,
    settledTickets,
    hasCompletedTutorial,
    votesRemainingForNextPendingShip,
    emailSubmittedOnMobile,
    preexistingUser,
    cursed,
    blessed,
    referralLink,
  }
}

export async function reportTourStep(tourStepId: string) {
  const session = await getSession()

  if (!session) {
    const err = new Error('No session when trying to report tour step')
    console.error(err)
    throw err
  }

  await fetch('https://api.airtable.com/v0/appTeNFYcUiYfGcR6/people', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          id: session.personId,
          fields: {
            tour_step: tourStepId,
          },
        },
      ],
    }),
  })
}

export async function reportLeaderboardParticipating(participating: boolean) {
  const session = await getSession()

  if (!session) {
    const err = new Error(
      'No session when trying to set leaderboard participation',
    )
    console.error(err)
    throw err
  }

  try {
    const response = await fetch(
      'https://api.airtable.com/v0/appTeNFYcUiYfGcR6/people',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              id: session.personId,
              fields: {
                show_in_leaderboard: participating,
              },
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const error = new Error(
        `Failed to update leaderboard participation: ${response.status} ${response.statusText}`,
      )
      console.error(error)
      throw error
    }
  } catch (err) {
    console.error('Error updating leaderboard participation:', err)
    throw err
  }

  // update the person cache
  updateShowInLeaderboard(participating)
}

export async function getLeaderboardParticipating(): Promise<boolean> {
  const record = await person()
  return !!record.fields.show_in_leaderboard
}
