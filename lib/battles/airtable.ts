import Airtable from 'airtable'
import { Ships, Person, Battles } from '../../types/battles/airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.BASE_ID!,
)

export const getProjects = async (userId: string): Promise<Ships[]> => {
  const person = await getPersonBySlackId(userId)
  if (!person) {
    throw new Error('User not found')
  }
  const records = await base('ships')
    .select({
      filterByFormula: `FIND('${person.identifier}', {entrant})`,
    })
    .all()
  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Ships),
  }))
}

export const getAllProjects = async (): Promise<Ships[]> => {
  const records = await base('ships')
    .select({
      filterByFormula: `eligible_for_voting`,
      fields: [
        'title',
        'credited_hours',
        'doubloon_payout',
        'project_source',
        'total_hours',
        'rating',
        'repo_url',
        'readme_url',
        'deploy_url',
        'autonumber',
        'screenshot_url',
        'entrant__slack_id',
        'ship_type',
        'ship_time',
        'update_description',
      ],
    })
    .all()
  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Ships),
  }))
}

export const createProject = async (
  shipsData: Ships & { slackId: string },
): Promise<Ships> => {
  const person = await getPersonBySlackId(shipsData.slackId)
  if (!person) {
    throw new Error('User not found')
  }
  const credited_hours = Number(shipsData.credited_hours)
  const projectData = {
    title: shipsData.title,
    credited_hours: credited_hours,
    repo_url: shipsData.repoUrl,
    readme_url: shipsData.readmeUrl,
    deploy_url: shipsData.deployUrl,
    screenshot_url: shipsData.screenshotUrl,
    entrant: [person.id as string],
  }
  const record = await base('ships').create(projectData)
  return {
    ...(record.fields as Ships),
  }
}

export const getMatchups = async (): Promise<Ships[]> => {
  const records = await base('ships')
    .select({
      sort: [{ field: 'autonumber', direction: 'desc' }],
      maxRecords: 2,
    })
    .all()
  return records.map((record) => record.fields as Ships)
}

export const submitVote = async (
  voteData: {
    slackId: string
    explanation: string
    winner: string
    loser: string
    winnerRating: number
    loserRating: number
    ts: number
    winner_readme_opened: boolean
    winner_repo_opened: boolean
    winner_demo_opened: boolean
    loser_readme_opened: boolean
    loser_repo_opened: boolean
    loser_demo_opened: boolean
    skips_before_vote: number
  } /*,
  bot: boolean,*/,
): Promise<Battles> => {
  const person = await getPersonBySlackId(voteData.slackId)
  if (!person) {
    throw new Error('User not found')
  }

  const K = 30
  const expectedScoreWinner =
    1 / (1 + Math.pow(10, (voteData.loserRating - voteData.winnerRating) / 400))
  const expectedScoreLoser = 1 - expectedScoreWinner

  const newWinnerRating = Math.round(
    voteData.winnerRating + K * (1 - expectedScoreWinner),
  )
  const newLoserRating = Math.round(
    voteData.loserRating + K * (0 - expectedScoreLoser),
  )

  const record = await base('battles').create({
    voter: [person.id as string],
    explanation: voteData.explanation,
    ships: [voteData.winner, voteData.loser],
    winner: [voteData.winner],
    loser: [voteData.loser],
    winner_rating: voteData.winnerRating,
    winner_adjustment: newWinnerRating - voteData.winnerRating,
    loser_rating: voteData.loserRating,
    loser_adjustment: newLoserRating - voteData.loserRating,
    is_tutorial_vote: !person.user_has_graduated,
    generated_at: voteData.ts,
    winner_readme_opened: voteData.winner_readme_opened,
    winner_repo_opened: voteData.winner_repo_opened,
    winner_demo_opened: voteData.winner_demo_opened,
    loser_readme_opened: voteData.loser_readme_opened,
    loser_repo_opened: voteData.loser_repo_opened,
    loser_demo_opened: voteData.loser_demo_opened,
    skips_before_vote: voteData.skips_before_vote,
    /*bot,*/
  })

  return {
    ...(record.fields as Battles),
  }
}

export const ensureUniqueVote = async (
  slackId: string,
  project1: string,
  project2: string,
): Promise<boolean> => {
  console.log('ensureUniqueVote', slackId, project1, project2)
  const records = await base('battles')
    .select({
      filterByFormula: `AND(
      {voter__slack_id} = '${slackId}',
      OR(
        AND({winner__record_id} = '${project1}', {loser__record_id} = '${project2}'),
        AND({winner__record_id} = '${project2}', {loser__record_id} = '${project1}')
      )
    )`,
      maxRecords: 1,
    })
    .all()
  console.log('ensureUniqueVote', records)

  return records.length === 0
}

export const getPersonBySlackId = async (
  slackId: string,
): Promise<Person | null> => {
  const records = await base('people')
    .select({
      filterByFormula: `{slack_id} = '${slackId}'`,
      maxRecords: 1,
    })
    .firstPage()
  if (records.length > 0) {
    const record = records[0]
    return {
      id: record.id,
      ...(record.fields as Person),
    }
  }

  return null
}
