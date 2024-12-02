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
    // let isBot = false;
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

    // Validate turnstile token
    // const turnstileResult = await fetch(
    //   "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    //   {
    //     method: "POST",
    //     body: JSON.stringify({
    //       secret: process.env.TURNSTILE_SECRET_KEY,
    //       response: voteData.turnstileToken,
    //     }),
    //     headers: { "Content-Type": "application/json" },
    //   },
    // ).then((r) => r.json());
    // if (!turnstileResult.success) {
    //   isBot = true;
    //   console.error(
    //     "I took one look at this request and do you know what I said? I said 'Wow, this looks like voter fraud'. Everyone knows it, folks. And I said, I'll tell you exactly what I said, I said 'I'm not going to let it happen'. I said that. I've never allowed voter fraud, never allowed it. They're saying I wasn't catching voter fraud earlier in the event, and you know what? They're wrong. We all know it, don't we? They're wrong about many things, so many things. Maybe all the things.",
    //     turnstileResult,
    //   );
    // }

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

    const _result = await submitVote(voteData /*, isBot*/)

    return NextResponse.json({ ok: true /*, reload: isBot */ })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 },
    )
  }
}
