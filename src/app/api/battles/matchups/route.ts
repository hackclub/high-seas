import { NextResponse } from "next/server";
import { getAllProjects } from "../../../../../lib/battles/airtable";
import { generateMatchup } from "../../../../../lib/battles/matchupGenerator";
import { Ships } from "../../../../../types/battles/airtable";
import Redis from "ioredis";
import { getSession } from "@/app/utils/auth";
const redis = new Redis(process.env.REDIS_URL as string, {
  tls: {
    rejectUnauthorized: false,
  },
});

const CACHE_DURATION = 5;

async function getCachedProjects(): Promise<Ships[]> {
  // const cachedProjects = await redis.get("all_projects");
  // if (cachedProjects) {
  //   return JSON.parse(cachedProjects);
  // }
  const projects = await getAllProjects();
  // await redis.setex("all_projects", CACHE_DURATION, JSON.stringify(projects));
  return projects;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getCachedProjects();
    const userSlackId = session.slackId;

    // TODO: this filtering could happen in the generateMatchup function!
    const votableProjects = projects.filter(
      (project) => project?.["entrant__slack_id"]?.[0] !== userSlackId,
    );
    const matchup = await generateMatchup(votableProjects, userSlackId);

    if (!matchup) {
      return NextResponse.json(
        { error: "No valid matchup found" },
        { status: 404 },
      );
    }

    return NextResponse.json(matchup);
  } catch (error) {
    console.error("Error generating matchup:", error);
    return NextResponse.json(
      { error: "Failed to generate matchup" },
      { status: 500 },
    );
  }
}
