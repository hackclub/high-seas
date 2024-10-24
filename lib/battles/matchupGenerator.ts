import { createHmac } from 'node:crypto'

import { Ships } from "../../types/battles/airtable"; 
import { ensureUniqueVote } from './airtable';

const HOUR_VARIATION_THRESHOLD = 0.5;
const PROBABILITY_SCALE = 50;
const MIN_MATCHUPS_THRESHOLD = 10;

function calculateMatchProbability(hours1: number, hours2: number): number {
  const diff = Math.abs(hours1 - hours2);
  return Math.exp(-(diff * diff) / (2 * PROBABILITY_SCALE * PROBABILITY_SCALE));
}

function hoursWithinRange(hours1: number, hours2: number): boolean {
  const maxHours = Math.max(hours1, hours2);
  const minHours = Math.min(hours1, hours2);
  return (maxHours - minHours) / minHours <= HOUR_VARIATION_THRESHOLD;
}

function calculateMatchupScore(project: Ships): number {
  const matchupsCount = project.matchups_count || 0;
  if (matchupsCount < MIN_MATCHUPS_THRESHOLD) {
    return 1000 - matchupsCount; // Prioritize projects with less than 10 matchups
  }
  return 1 / (matchupsCount - MIN_MATCHUPS_THRESHOLD + 1);
}

export function signMatchup(matchup: { project1: Ships; project2: Ships; matchQuality: number }, userSlackId: string): { project1: Ships; project2: Ships; matchQuality: number, signature: string, ts: number } {
  const secret = process.env.MATCHUP_SECRET
  if (!secret) throw new Error("No MATCHUP_SECRET env var set")
  if (secret.length < 32) throw new Error("MATCHUP_SECRET must be at least 32 characters long")
  const ts = Date.now()

  // Randomize the order of projects
  const [project1, project2] = Math.random() < 0.5 
    ? [matchup.project1, matchup.project2] 
    : [matchup.project2, matchup.project1];

  const matchupIDs = [project1.id, project2.id].sort()
  const objToSign = { ts, matchupIDs, userSlackId }
  const signature = createHmac("sha256", secret).update(JSON.stringify(objToSign)).digest('hex')

  return { project1, project2, matchQuality: matchup.matchQuality, ts, signature };
}

export function verifyMatchup(signedMatchup: { winner: string; loser: string; matchQuality: number, signature: string, ts: number }, userSlackId: string): boolean {
  const secret = process.env.MATCHUP_SECRET
  if (!secret) throw new Error("No MATCHUP_SECRET env var set")
  if (secret.length < 32) throw new Error("MATCHUP_SECRET must be at least 32 characters long")
  const tsNow = Date.now()
  const matchupIDs = [signedMatchup.winner, signedMatchup.loser].sort()
  const objToVerify = { ts: signedMatchup.ts, matchupIDs, userSlackId }

  const validSig = createHmac("sha256", secret).update(JSON.stringify(objToVerify)).digest('hex') === signedMatchup.signature
  const validTs = tsNow - signedMatchup.ts < 1000* 60 * 60 * 5 // 5 hours
  return validSig && validTs
}

/**
 * Generates a matchup between two projects for voting.
 * 
 * Process:
 * 1. Sort projects by matchup score (prioritizing less-matched projects).
 * 2. Select first project from top 20% of sorted projects.
 * 3. Filter valid matches based on hours similarity.
 */
export async function generateMatchup(
  projects: Ships[],
  userSlackId: string,
): Promise<{ project1: Ships; project2: Ships; matchQuality: number; signature: string } | null> {
  const sortedProjects = projects.sort((a, b) => calculateMatchupScore(b) - calculateMatchupScore(a));
  
  const topProjectsCount = Math.max(1, Math.floor(sortedProjects.length * 0.2));
  const project1 = sortedProjects[Math.floor(Math.random() * topProjectsCount)];

  const validMatches = sortedProjects
    .filter((p) => p.id !== project1.id && hoursWithinRange(project1.hours, p.hours));

  // if (validMatches.length === 0) return null;

  const probabilities = validMatches.map((p) =>
    calculateMatchProbability(project1.hours, p.hours)
  );
  const totalProbability = probabilities.reduce((a, b) => a + b, 0);
  const normalizedProbabilities = probabilities.map((p) => p / totalProbability);

  const randomValue = Math.random();
  let cumulativeProbability = 0;
  let project2Index = 0;

  for (let i = 0; i < normalizedProbabilities.length; i++) {
    cumulativeProbability += normalizedProbabilities[i];
    if (randomValue <= cumulativeProbability) {
      project2Index = i;
      break;
    }
  }

  const project2 = validMatches[project2Index];
  // do we even need this anymorw? It's a remant of past
  const matchQuality = 1 / (1 + Math.abs(project1.hours - project2.hours) / Math.max(project1.hours, project2.hours));
  
  const uniqueVote = await ensureUniqueVote(userSlackId, project1.id, project2.id)
  if (!uniqueVote) return null;

  return signMatchup({ project1, project2, matchQuality }, userSlackId);
}
