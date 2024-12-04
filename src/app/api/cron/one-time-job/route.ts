import Airtable from 'airtable'
import sum from '../../../../../lib/sum'
import Bottleneck from 'bottleneck'
const limiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 333,
})

export const dynamic = 'force-dynamic'

const grantRanges = []
grantRanges.push({
  from: '2024-11-25',
  to: '2024-11-26',
  grantId: 'reco093P2OdI56emA',
})
grantRanges.push({
  from: '2024-11-26',
  to: '2024-11-27',
  grantId: 'recZuOCRPBNWzMszf',
})
grantRanges.push({
  from: '2024-11-27',
  to: '2024-11-28',
  grantId: 'recAM4oFAakhwz3Dm',
})
grantRanges.push({
  from: '2024-11-28',
  to: '2024-11-29',
  grantId: 'rechsY0LtMVLjRp25',
})
grantRanges.push({
  from: '2024-11-29',
  to: '2024-11-30',
  grantId: 'recrpvik1Izru1ksK',
})
grantRanges.push({
  from: '2024-11-30',
  to: '2024-12-01',
  grantId: 'recC9Bp0e0TCVIvIF',
})
grantRanges.push({
  from: '2024-12-01',
  to: '2024-12-02',
  grantId: 'recSjinfBliBbZNnt',
})

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: process.env.AIRTABLE_ENDPOINT_URL,
}).base('appTeNFYcUiYfGcR6')

async function getWakaTime(slackId: string, from: string, to: string) {
  console.log('checking wakatime for', slackId)
  const summaryRes = await fetch(
    `https://waka.hackclub.com/api/summary?from=${from}&to=${to}&user=${slackId}&recompute=true`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WAKA_API_KEY}`,
        'content-type': 'application/json',
      },
    },
  )
  if (summaryRes.status != 200) {
    return false
  }
  const data = await summaryRes.json()
  const projects = data.projects.map((project) => project.total)
  const projectsTotalTime = sum(projects) / 60 / 60
  // console.log("sum", projectsTotalTime)
  return projectsTotalTime > 1
}

const limitedWakaTime = limiter.wrap(getWakaTime)

async function task() {
  const userChunk = await base('people')
    .select({
      filterByFormula: `AND(
    temp_thanksgiving_payout = FALSE(),
    verified_eligible = TRUE()
    )`,
      maxRecords: 10,
    })
    .all()

  if (userChunk.length == 0) {
    return 0
  }

  const updatedUsers = userChunk.map(async (user) => {
    const updated_grants = new Set(user?.fields?.doubloon_grants || [])

    for (const range of grantRanges) {
      if (await limitedWakaTime(user?.fields?.slack_id, range.from, range.to)) {
        console.log('user has grant from ', range.from)
        updated_grants.add(range.grantId)
      }
    }
    // if (await limitedWakaTime(user?.fields?.slack_id, '2024-11-27', '2024-11-28')) {
    //   updated_grants.push('recAM4oFAakhwz3Dm')
    // }
    return {
      id: user.id,
      fields: {
        temp_thanksgiving_payout: true,
        doubloon_grants: Array.from(updated_grants),
      },
    }
  })

  const results = await Promise.all(updatedUsers)

  console.log(JSON.stringify(results, null, 2))
  await base('people').update(results)
  return userChunk.length
}
export async function GET() {
  let run = true

  while (run) {
    const result = await task()
    console.log('result', result)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (result == 0) {
      run = false
    }
  }

  return Response.json({ success: true })
}
