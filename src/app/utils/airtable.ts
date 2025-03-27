'use server'

import { getSession } from './auth'
import { person, updateShowInLeaderboard } from './server/data'
import { getSelfPerson } from './server/airtable'

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

  await fetch(`https://api.airtable.com/v0/${process.env.BASE_ID}/people`, {
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
      `https://api.airtable.com/v0/${process.env.BASE_ID}/people`,
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
