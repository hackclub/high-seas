import { createHmac } from 'node:crypto'

import type { Ships } from '../../types/battles/airtable'
import { ensureUniqueVote, getPersonBySlackId } from './airtable'

export function generateTutorialMatchup() {
  const simpleNumbers = {
    id: 'rectt5JQEF0jffbJF',
    title: 'Simple Numbers',
    repo_url: 'https://github.com/polytroper/simplenumbers',
    deploy_url: 'https://polytrope.com/simplenumbers/',
    screenshot_url: 'https://polytrope.com/projects/simplenumbers_256.jpg',
    readme_url:
      'https://raw.githubusercontent.com/polytroper/simplenumbers/refs/heads/master/README.md',
    credited_hours: 3,
    total_hours: 3,
    rating: 0,
    entrant__slack_id: [],
  }

  const wigglyDragon = {
    id: 'recC4Wr3kPgZHHhJr',
    title: 'Wiggly dragon!!',
    repo_url: 'https://github.com/maxwofford/wiggling-dragon',
    deploy_url: 'https://maxwofford.com/wiggling-dragon/',
    screenshot_url:
      'https://cloud-2mxjbb9vc-hack-club-bot.vercel.app/0ezgif.com-video-to-gif-converter.gif',
    readme_url:
      'https://raw.githubusercontent.com/maxwofford/wiggling-dragon/refs/heads/main/README.md',
    credited_hours: 1.6,
    total_hours: 1.6,
    rating: 0,
    entrant: [],
    contest: [],
    matchups: [],
    matchups_count: 0,
    wins: [],
    wins_adjustments: 0,
    losses: [],
    losses_adjustments: 0,
    autonumber: 0,
    entrant__slack_id: [],
  }

  const r = Math.random()

  return {
    project1: r < 0.5 ? simpleNumbers : wigglyDragon,
    project2: r < 0.5 ? wigglyDragon : simpleNumbers,
    signature: '',
    ts: Date.now(),
  }
}

export function signMatchup(
  matchup: { project1: Ships; project2: Ships },
  userSlackId: string,
): { project1: Ships; project2: Ships; signature: string; ts: number } {
  const secret = process.env.MATCHUP_SECRET
  if (!secret) throw new Error('No MATCHUP_SECRET env var set')
  if (secret.length < 32)
    throw new Error('MATCHUP_SECRET must be at least 32 characters long')
  const ts = Date.now()

  // Randomize the order of projects
  const [project1, project2] =
    Math.random() < 0.5
      ? [matchup.project1, matchup.project2]
      : [matchup.project2, matchup.project1]

  const matchupIDs = [project1.id, project2.id].sort()
  const objToSign = { ts, matchupIDs, userSlackId }
  const signature = createHmac('sha256', secret)
    .update(JSON.stringify(objToSign))
    .digest('hex')

  return { project1, project2, ts, signature }
}

export function verifyMatchup(
  signedMatchup: {
    winner: string
    loser: string
    matchQuality: number
    signature: string
    ts: number
  },
  userSlackId: string,
): boolean {
  const secret = process.env.MATCHUP_SECRET
  if (!secret) throw new Error('No MATCHUP_SECRET env var set')
  if (secret.length < 32)
    throw new Error('MATCHUP_SECRET must be at least 32 characters long')
  const tsNow = Date.now()
  const matchupIDs = [signedMatchup.winner, signedMatchup.loser].sort()
  const objToVerify = { ts: signedMatchup.ts, matchupIDs, userSlackId }

  const validSig =
    createHmac('sha256', secret)
      .update(JSON.stringify(objToVerify))
      .digest('hex') === signedMatchup.signature
  const validTs = tsNow - signedMatchup.ts < 1000 * 60 * 60 * 5 // 5 hours
  return validSig && validTs
}

// TODO: Add docstring
export async function generateMatchup(
  projects: Ships[],
  userSlackId: string,
  attempts = 0,
): Promise<{
  project1: Ships
  project2: Ships
  signature: string
  ts: number
} | null> {
  if (attempts >= 5) {
    console.error('Failed to generate a unique matchup after 5 attempts')
    return null
  }

  const user = await getPersonBySlackId(userSlackId)
  if (!user) return null
  const userVotedShips = new Set(user.all_battle_ship_autonumbers || [])

  const availableProjects = projects.filter(
    (p) =>
      !userVotedShips.has(p.autonumber?.toString()) &&
      p.entrant__slack_id?.[0] !== userSlackId,
  )
  if (availableProjects.length < 2) return null

  const paidProjects = availableProjects.filter(
    (p) => p.doubloon_payout || p.project_source === 'arcade',
  )
  const unpaidProjects = availableProjects.filter(
    (p) => p.doubloon_payout == null && p.project_source === 'high_seas',
  )

  const usePaidComparison = unpaidProjects.length === 0 // if true => paid v paid otherwise unpaid v paid

  let project1, project2

  if (usePaidComparison) {
    const shuffledPaidProjects = [...paidProjects].sort(
      () => Math.random() - 0.5,
    )
    project1 = shuffledPaidProjects[0]
    const project1Hours = project1.total_hours || 0
    const hourRange = project1Hours * 0.5

    const similarHourProjects = shuffledPaidProjects.slice(1).filter((p) => {
      // Filter out projects with identical repos
      if (project1.repo_url == p.repo_url) return false

      const hours = p.total_hours || 0
      return Math.abs(hours - project1Hours) <= hourRange
    })

    project2 =
      similarHourProjects.length > 0
        ? similarHourProjects[
            Math.floor(Math.random() * similarHourProjects.length)
          ]
        : shuffledPaidProjects[1]
  } else {
    const now = Date.now()
    const weightedUnpaidProjects = unpaidProjects.map((p) => ({
      project: p,
      // tbh, weights can be pretty simple, but this works fine
      weight:
        1 + (now - new Date(p.ship_time).getTime()) / (1000 * 60 * 60 * 24),
    }))
    let totalWeight = weightedUnpaidProjects.reduce(
      (sum, p) => sum + p.weight,
      0,
    )
    let random = (Math.random() * totalWeight) / 2

    for (const { project, weight } of weightedUnpaidProjects.sort(
      (a, b) => b.weight - a.weight,
    )) {
      random -= weight * 1.2
      if (random <= 0) {
        project1 = project
        break
      }
    }
    if (!project1) project1 = unpaidProjects[0] // Fallback to oldest project

    const project1Hours = project1.total_hours || 0
    const hourRange = project1Hours * 0.5 // Chris, setting this to 50% but can bring it down to 30% if we want

    const similarHourProjects = paidProjects.filter((p) => {
      // Filter out projects with identical repos
      if (project1.repo_url == p.repo_url) return false

      const hours = p.total_hours || 0
      return Math.abs(hours - project1Hours) <= hourRange
    })

    const candidatePool =
      similarHourProjects.length > 0 ? similarHourProjects : paidProjects

    const weightedProjects = candidatePool.map((p, i) => ({
      project: p,
      weight:
        Math.pow(0.8, i) *
        (1 /
          (1 + Math.abs((p.total_hours || 0) - project1Hours) / project1Hours)),
    }))

    totalWeight = weightedProjects.reduce((sum, p) => sum + p.weight, 0)
    random = Math.random() * totalWeight

    for (const { project, weight } of weightedProjects) {
      random -= weight
      if (random <= 0) {
        project2 = project
        break
      }
    }
    if (!project2) project2 = paidProjects[0]
  }

  const uniqueVote = await ensureUniqueVote(
    userSlackId,
    project1.id,
    project2.id,
  )

  if (!uniqueVote) {
    return generateMatchup(projects, userSlackId, attempts + 1)
  }

  const [finalProject1, finalProject2] =
    Math.random() < 0.5 ? [project1, project2] : [project2, project1]

  return signMatchup(
    {
      project1: finalProject1,
      project2: finalProject2,
    },
    userSlackId,
  )
}
