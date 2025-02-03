import { NextResponse } from 'next/server'
import {
  ensureUniqueVote,
  submitVote,
} from '../../../../../lib/battles/airtable'
import { getSession } from '@/app/utils/auth'
import { verifyMatchup } from '../../../../../lib/battles/matchupGenerator'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const voteData = await request.json()

    const winnerAnalytics = voteData.analytics.projectResources[
      voteData.winner
    ] || {
      readmeOpened: false,
      repoOpened: false,
      demoOpened: false,
    }

    const loserAnalytics = voteData.analytics.projectResources[
      voteData.loser
    ] || {
      readmeOpened: false,
      repoOpened: false,
      demoOpened: false,
    }

    const matchup = {
      winner: voteData.winner,
      loser: voteData.loser,
      signature: voteData.signature,
      ts: voteData.ts,
    }
    // @ts-expect-error because i don't understand typescript
    const isVerified = verifyMatchup(matchup, session.slackId)
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Invalid matchup signature' },
        { status: 400 },
      )
    }
    const isUnique = await ensureUniqueVote(
      session.slackId,
      voteData.winner,
      voteData.loser,
    )
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Vote already submitted' },
        { status: 400 },
      )
    }

    voteData.winner_readme_opened = winnerAnalytics.readmeOpened
    voteData.winner_repo_opened = winnerAnalytics.repoOpened
    voteData.winner_demo_opened = winnerAnalytics.demoOpened
    voteData.loser_readme_opened = loserAnalytics.readmeOpened
    voteData.loser_repo_opened = loserAnalytics.repoOpened
    voteData.loser_demo_opened = loserAnalytics.demoOpened
    voteData.skips_before_vote = voteData.analytics.skipsBeforeVote

    const _result = await submitVote(voteData)

    return NextResponse.json({ ok: true /*, reload: isBot */ })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 },
    )
  }
}
