import Airtable from "airtable";
// import { Ships, Battles, Person } from '../types/airtable';
import { Ships, Person, Battles } from '../../types/battles/airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.BASE_ID!,
);

export const getProjects = async (userId: string): Promise<Ships[]> => {
  const person = await getPersonBySlackId(userId);
  if (!person) {
    throw new Error("User not found");
  }
  const records = await base("ships")
    .select({
      filterByFormula: `FIND('${person.identifier}', {entrant})`,
    })
    .all();
  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Ships),
  }));
};

export const getAllProjects = async (): Promise<Ships[]> => {
  const records = await base("ships")
    .select({ filterByFormula: `AND(
      NOT(hidden),
      {project_source} != 'test',
      {project_source} != 'tutorial',
      {ship_status} != 'staged',
      {ship_status} != 'deleted'
      )` })
    .all();
  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Ships),
  }));
};

export const createProject = async (
  shipsData: Ships & { slackId: string },
): Promise<Ships> => {
  const person = await getPersonBySlackId(shipsData.slackId);
  if (!person) {
    throw new Error("User not found");
  }
  const hours = Number(shipsData.hours);
  const projectData = {
    title: shipsData.title,
    hours: hours,
    repo_url: shipsData.repoUrl,
    readme_url: shipsData.readmeUrl,
    deploy_url: shipsData.deployUrl,
    screenshot_url: shipsData.screenshotUrl,
    entrant: [person.id as string],
  };
  const record = await base("ships").create(projectData);
  return {
    ...(record.fields as Ships),
  };
};

export const getMatchups = async (): Promise<Ships[]> => {
  const records = await base("ships")
    .select({
      sort: [{ field: "autonumber", direction: "desc" }],
      maxRecords: 2,
    })
    .all();
  return records.map((record) => record.fields as Ships);
};

export const submitVote = async (voteData: {
  slackId: string;
  explanation: string;
  winner: string;
  loser: string;
  winnerRating: number;
  loserRating: number;
}): Promise<Battles> => {
  const person = await getPersonBySlackId(voteData.slackId);
  if (!person) {
    throw new Error("User not found");
  }

  const K = 30;
  const expectedScoreWinner =
    1 /
    (1 + Math.pow(10, (voteData.loserRating - voteData.winnerRating) / 400));
  const expectedScoreLoser = 1 - expectedScoreWinner;

  const newWinnerRating = Math.round(
    voteData.winnerRating + K * (1 - expectedScoreWinner),
  );
  const newLoserRating = Math.round(
    voteData.loserRating + K * (0 - expectedScoreLoser),
  );

  const record = await base("battles").create({
    voter: [person.id as string],
    explanation: voteData.explanation,
    ships: [voteData.winner, voteData.loser],
    winner: [voteData.winner],
    loser: [voteData.loser],
    winner_rating: voteData.winnerRating,
    winner_adjustment: newWinnerRating - voteData.winnerRating,
    loser_rating: voteData.loserRating,
    loser_adjustment: newLoserRating - voteData.loserRating,
  });

  return {
    ...(record.fields as Battles),
  };
};

export const ensureUniqueVote = async (
  slackId: string,
  project1: string,
  project2: string,
): Promise<boolean> => {
  console.log("ensureUniqueVote", slackId, project1, project2);
  const records = await base("battles").select({
    filterByFormula: `AND(
      {voter__slack_id} = '${slackId}',
      OR(
        AND({winner__record_id} = '${project1}', {loser__record_id} = '${project2}'),
        AND({winner__record_id} = '${project2}', {loser__record_id} = '${project1}')
      )
    )`,
    maxRecords: 1
  }).all()
  console.log("ensureUniqueVote", records);

  return records.length === 0;
}

export const getPersonBySlackId = async (
  slackId: string,
): Promise<Person | null> => {
  const records = await base("people")
    .select({
      filterByFormula: `{slack_id} = '${slackId}'`,
      maxRecords: 1,
    })
    .firstPage();
  if (records.length > 0) {
    const record = records[0];
    return {
      id: record.id,
      ...(record.fields as Person),
    };
  }

  return null;
};

export const createPerson = async (
  personData: Person,
): Promise<Person> => {
  const record = await base("people").create(personData);
  return {
    ...(record.fields as Person),
  };
};