"use server";

import { getSelfPerson, getSelfPersonId } from "@/app/utils/airtable";
import { getSession } from "@/app/utils/auth";
import { getWakaSessions } from "@/app/utils/waka";
import Airtable from "airtable";

const peopleTableName = "people";
const shipsTableName = "ships";

const base = () => {
  const baseId = process.env.BASE_ID;
  if (!baseId) throw new Error("No Base ID env var set");

  return Airtable.base(baseId);
};

export interface Ship {
  id: string; // The Airtable row's ID.
  title: string;
  repoUrl: string;
  deploymentUrl?: string;
  readmeUrl: string;
  screenshotUrl: string;
  // doubloonsPaid?: number;
  matchups_count: number;
  hours: number | null;
  voteRequirementMet: boolean;
  doubloonPayout: number;
  shipType: string;
  shipStatus: string;
  wakatimeProjectName: string;
  createdTime: string;
}

export async function getUserShips(slackId: string): Promise<Ship[]> {
  const ships: Ship[] = [];

  const [wakaData, records] = await Promise.all([
    getWakaSessions(),
    base()(shipsTableName)
      .select({
        filterByFormula: `AND(
      TRUE(),
      '${slackId}' = {entrant__slack_id},
      {project_source} != 'arcade'
      )`,
      })
      .all(),
  ]);

  if (!wakaData || !records)
    throw new Error("No Waka data or Airtable records");

  const hoursForProject = (wakatimeProjectName: string): number | null => {
    const seconds = wakaData.projects.find(
      (p: { key: string; total: number }) => p.key == wakatimeProjectName
    )?.total;
    if (!seconds) return null;
    return Math.round(seconds / 60 / 6) / 10;
  };

  records.forEach((r) => {
    const projectRecord = {
      id: r.id as string,
      title: r.get("title") as string,
      repoUrl: r.get("repo_url") as string,
      deploymentUrl: r.get("deploy_url") as string,
      readmeUrl: r.get("readme_url") as string,
      screenshotUrl: r.get("screenshot_url") as string,
      voteRequirementMet: Boolean(r.get("vote_requirement_met")),
      matchups_count: r.get("matchups_count") as number,
      doubloonPayout: r.get("doubloon_payout") as number,
      shipType: r.get("ship_type") as string,
      shipStatus: r.get("ship_status") as string,
      wakatimeProjectName: r.get("wakatime_project_name") as string,
      hours: r.get("hours") as number | null,
      createdTime: r.get("created_time") as string,
    };

    if (projectRecord.shipType === "staged" || projectRecord.hours === null) {
      projectRecord.hours = hoursForProject(projectRecord.wakatimeProjectName);
    } else {
      projectRecord.hours = Math.round(projectRecord.hours * 10) / 10;
    }

    ships.push(projectRecord);
  });
  return ships;
}

export async function createShip(formData: FormData) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to submit a ship with no Slack OAuth session"
    );
    console.log(error);
    throw error;
  }

  const slackId = session.payload.sub;
  const entrantId = await getSelfPerson(slackId).then((p) => p.id);

  const isShipUpdate = formData.get("isShipUpdate");

  base()(shipsTableName).create(
    [
      {
        // @ts-expect-error No overload matches this call - but it does
        fields: {
          title: formData.get("title"),
          entrant: [entrantId],
          repo_url: formData.get("repo_url"),
          readme_url: formData.get("readme_url"),
          deploy_url: formData.get("deployment_url"),
          screenshot_url: formData.get("screenshot_url"),
          ship_type: isShipUpdate ? "update" : "project",
          update_description: isShipUpdate
            ? formData.get("updateDescription")
            : null,
          wakatime_project_name: formData.get("wakatime_project_name"),
        },
      },
    ],
    (err: Error, records: any) => {
      if (err) console.error(err);
    }
  );
}

export async function updateShip(ship: Ship) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to stage a ship with no Slack OAuth session"
    );
    console.log(error);
    throw error;
  }

  console.log("updating!", ship);

  base()(shipsTableName).update(
    [
      {
        id: ship.id,
        fields: {
          title: ship.title,
          repo_url: ship.repoUrl,
          readme_url: ship.readmeUrl,
          deploy_url: ship.deploymentUrl,
          screenshot_url: ship.screenshotUrl,
        },
      },
    ],
    (err: Error, records: any) => {
      if (err) console.error(err);
    }
  );
}

export async function stagedToShipped(ship: Ship) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to ship a staged ship with no Slack OAuth session"
    );
    console.log(error);
    throw error;
  }

  let hours;
  if (ship.wakatimeProjectName) {
    const wakatimeProjects = await getWakaSessions().then((p) => p.projects);
    hours =
      wakatimeProjects.find(
        ({ key }: { key: string }) => key === ship.wakatimeProjectName
      ).total /
      60 /
      60;
  }

  base()(shipsTableName).update(
    [
      {
        id: ship.id,
        fields: {
          ship_status: "shipped",
          hours,
          ship_time: new Date().toISOString(),
        },
      },
    ],
    (err: Error, records: any) => {
      if (err) console.error(err);
    }
  );
}
