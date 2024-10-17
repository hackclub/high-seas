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
  hours: number | null;
  voteRequirementMet: boolean;
  doubloonPayout: number;
  shipType: string;
  shipStatus: string;
  wakatimeProjectName: string;
}

export async function getUserShips(slackId: string): Promise<Ship[]> {
  console.log("getting ships of", slackId);
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

  if (!wakaData || !records) {
    throw new Error("No Waka data or Airtable records");
  }

  const hoursForProject = (projectName: string): number | null => {
    const seconds = wakaData.projects.find(
      (p: { key: string; total: number }) => p.key == projectName
    )?.total;
    if (!seconds) return null;
    return seconds / 60 / 60;
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
      doubloonPayout: r.get("doubloon_payout") as number,
      shipType: r.get("ship_type") as string,
      shipStatus: r.get("ship_status") as string,
      wakatimeProjectName: r.get("wakatime_project_name") as string,
      hours: r.get("hours") as number | null,
    };

    if (projectRecord.hours === null) {
      projectRecord.hours = hoursForProject(projectRecord.wakatimeProjectName);
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

  console.log(formData, slackId, entrantId);

  const isShipUpdate = formData.get("isShipUpdate");
  const hourCount = formData.get("hours");
  const wakatimeProjectName = formData.get("wakatime_project_name");

  base()(shipsTableName).create(
    [
      {
        // @ts-expect-error No overload matches this call - but it does
        fields: {
          title: formData.get("title"),
          hours: Number(hourCount),
          entrant: [entrantId],
          repo_url: formData.get("repo_url"),
          readme_url: formData.get("readme_url"),
          deploy_url: formData.get("deployment_url"),
          screenshot_url: formData.get("screenshot_url"),
          ship_type: isShipUpdate ? "update" : "project",
          update_description: isShipUpdate
            ? formData.get("updateDescription")
            : null,
          wakatime_project_name: wakatimeProjectName,
        },
      },
    ],
    function (err: Error, records: any) {
      if (err) {
        console.error(err);
        return;
      }
      if (!records) console.error("No records!");
    }
  );
}

export async function updateShip(ship: Ship) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to submit a ship with no Slack OAuth session"
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
    function (err: Error, records: any) {
      if (err) {
        console.error(err);
        return;
      }
      if (!records) console.error("No records!");
    }
  );
}

export async function stagedToShipped(ship: Ship) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to submit a ship with no Slack OAuth session"
    );
    console.log(error);
    throw error;
  }

  console.log("shipping from staged!", ship);

  base()(shipsTableName).update(
    [
      {
        id: ship.id,
        fields: {
          ship_status: "shipped",
          ship_time: new Date().toISOString(),
        },
      },
    ],
    function (err: Error, records: any) {
      if (err) {
        console.error(err);
        return;
      }
      if (!records) console.error("No records!");
    }
  );
}
