'use server'

import Airtable from 'airtable'
import { getSession } from './auth'
import { TavernEventItem } from '../harbor/tavern/tavern-utils'

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
})

export type RsvpStatus = 'none' | 'organizer' | 'participant'
export const setTavernRsvpStatus = async (rsvpStatus: RsvpStatus) => {
  // check auth
  const session = await getSession()
  if (!session) {
    return
  }
  if (!session.personId) {
    return
  }

  // update status
  const base = Airtable.base(process.env.BASE_ID)
  const result = await base('people').update(session.personId, {
    tavern_rsvp_status: rsvpStatus,
  })

  return result.get('tavern_rsvp_status')
}

export const getTavernRsvpStatus = async () => {
  // check auth
  const session = await getSession()
  if (!session) {
    return
  }
  if (!session.personId) {
    return
  }

  // get status
  const base = Airtable.base(process.env.BASE_ID)
  const record = await base('people').find(session.personId)
  return record.get('tavern_rsvp_status') as RsvpStatus
}

export const submitMyTavernLocation = async (tavernId: string) => {
  // check auth
  const session = await getSession()
  if (!session) {
    return
  }
  if (!session.personId) {
    return
  }

  // update status
  const base = Airtable.base(process.env.BASE_ID)

  await base('people').update(session.personId, {
    taverns_attendee: tavernId ? [tavernId] : [],
  })
}

export const getMyTavernLocation: Promise<
  TavernEventItem | null
> = async () => {
  // check auth
  const session = await getSession()
  if (!session) {
    return
  }
  if (!session.personId) {
    return
  }

  // update status
  const base = Airtable.base(process.env.BASE_ID)

  const foundTavern = await base('taverns')
    .select({
      filterByFormula: `FIND('${session.personId}', {attendee_record_ids} & '')`,
    })
    .firstPage()
    .then((r) => r[0])

  console.log('getMyTavernLocation: ', foundTavern)

  if (!foundTavern) return null

  return {
    id: foundTavern.id,
    city: foundTavern.get('city'),
    geocode: foundTavern.get('map_geocode'),
    locality: foundTavern.get('locality'),
    attendeeCount: foundTavern.get('attendees_count'),
    organizers: foundTavern.get('organizers'),
    channel: foundTavern.get('channel'),
    eventDate: foundTavern.get('event_date'),
  }
}

export async function submitShirtSize(size: string) {
  // check auth
  const session = await getSession()
  if (!session) {
    return
  }
  if (!session.personId) {
    return
  }

  if (!['Small', 'Medium', 'Large', 'XL', 'XXL'].includes(size)) {
    return
  }

  // update status
  const base = Airtable.base(process.env.BASE_ID)

  await base('people').update(session.personId, {
    shirt_size: size,
  })
}

export async function getShirtSize() {
  // check auth
  const session = await getSession()
  if (!session) {
    return
  }
  if (!session.personId) {
    return
  }

  // update status
  const base = Airtable.base(process.env.BASE_ID)

  return await base('people')
    .find(session.personId)
    .then((r) => r.get('shirt_size'))
}
