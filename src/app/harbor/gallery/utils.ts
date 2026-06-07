'use server'

import { Ship } from '../shipyard/ship-utils'

interface AirtableShipRow {
  id: string
  fields: {
    title: string
    readme_url: string
    repo_url: string
    screenshot_url: string
    hours: number
    rating: number
  }
}

export async function getShips(offset: string | undefined): Promise<{
  ships: Ship[]
  offset: string | undefined
}> {
  const res = await fetch(
    `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/ships?view=Grid%20view${offset ? `&offset=${offset}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'User-Agent': 'highseas.hackclub.com (getShips)',
      },
    },
  )
  let data
  try {
    data = await res.json()
  } catch (e) {
    console.error(e, await res.text())
    throw e
  }

  // TODO: Error checking
  const ships = data.records.map((r: AirtableShipRow) => {
    return {
      id: r.id,
      title: r.fields.title,
      readmeUrl: r.fields.readme_url,
      hours: r.fields.hours,
      repoUrl: r.fields.repo_url,
      screenshotUrl: r.fields.screenshot_url,
      rating: r.fields.rating,
    }
  })

  return {
    ships,
    offset: data.offset,
  }
}
