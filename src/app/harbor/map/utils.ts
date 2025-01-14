'use server'

import { getCachedProjects } from '@/app/api/battles/matchups/get-cached-projects'
import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.BASE_ID!,
)

export async function mapShips() {
  console.log('Starting mapShips')

  const records = await base('ships')
    .select({
      // filterByFormula: `eligible_for_voting`,
      fields: [
        'title',
        'doubloon_payout',
        'total_hours',
        'repo_url',
        'readme_url',
        'deploy_url',
        'screenshot_url',
        'entrant__slack_id',
      ],
    })
    .all()

  return records.map((record) => ({
    id: record.id,
    ...record.fields,
  }))
}
