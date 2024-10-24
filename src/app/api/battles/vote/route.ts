import { NextResponse } from "next/server";
import { ensureUniqueVote, submitVote } from "../../../../../lib/battles/airtable";
import { getSession } from "@/app/utils/auth";
import { verifyMatchup } from "../../../../../lib/battles/matchupGenerator";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const voteData = await request.json();
    const matchup = {
      winner: voteData.winner,
      loser: voteData.loser,
      signature: voteData.signature,
      ts: voteData.ts,
    }
    // @ts-expect-error because i don't understand typescript
    const isVerified = verifyMatchup(matchup, session.payload.sub);
    if (!isVerified) {
      return NextResponse.json({ error: "Invalid matchup signature" }, { status: 400 });
    }
    const isUnique = await ensureUniqueVote(session.payload.sub, voteData.winner, voteData.loser);
    if (!isUnique) {
      return NextResponse.json({ error: "Vote already submitted" }, { status: 400 });
    }
    const _result = await submitVote(voteData);

    return NextResponse.json({ok: true});
  } catch (error) {
    console.error("Error submitting vote:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 },
    );
  }
}