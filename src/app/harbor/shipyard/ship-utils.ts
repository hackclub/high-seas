"use server";

import { getSelfPerson } from "@/app/utils/airtable";
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

type ShipType = "project" | "update";
type ShipStatus = "shipped" | "staged" | "deleted";
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
  credited_hours: number | null;
  total_hours: number | null;
  voteRequirementMet: boolean;
  doubloonPayout: number;
  shipType: ShipType;
  shipStatus: ShipStatus;
  wakatimeProjectNames: string[];
  createdTime: string;
  updateDescription: string | null;
  reshippedFromId: string | null;
  reshippedToId: string | null;
}
const shipToFields = (ship: Ship, entrantId: string) => ({
  // Think of this as `impl Clone`. Only include the fields you want in a cloned Ship.
  title: ship.title,
  entrant: [entrantId],
  repo_url: ship.repoUrl,
  readme_url: ship.readmeUrl,
  deploy_url: ship.deploymentUrl,
  screenshot_url: ship.screenshotUrl,
  ship_type: ship.shipType,
  update_description: ship.updateDescription,
  wakatime_project_name: ship.wakatimeProjectNames.join("$$xXseparatorXx$$"),
});

export async function getUserShips(
  slackId: string,
): Promise<{ ships: Ship[]; shipChains: Map<string, string[]> }> {
  const ships: Ship[] = [];

  const [wakaData, records] = await Promise.all([
    getWakaSessions(),
    base()(shipsTableName)
      .select({
        filterByFormula: `AND(
      TRUE(),
      '${slackId}' = {entrant__slack_id},
      {project_source} != 'arcade',
      {ship_status} != 'deleted'
      )`,
      })
      .all(),
  ]);

  console.log("osntoiearsntiersntne333", records);

  if (!wakaData || !records)
    throw new Error("No Waka data or Airtable records");

  const hoursForProject = (wakatimeProjectName: string): number | null => {
    const seconds = wakaData.projects.find(
      (p: { key: string; total: number }) => p.key == wakatimeProjectName,
    )?.total;
    if (!seconds) return null;
    return Math.round(seconds / 60 / 6) / 10;
  };

  records.forEach((r) => {
    const reshippedToIdRaw = r.get("reshipped_to") as [string] | null;
    const reshippedToId = reshippedToIdRaw ? reshippedToIdRaw[0] : null;

    const reshippedFromIdRaw = r.get("reshipped_from") as [string] | null;
    const reshippedFromId = reshippedFromIdRaw ? reshippedFromIdRaw[0] : null;

    console.log("attempting", r.get("wakatime_project_name"));
    const wakatimeProjectNames = (
      r.get("wakatime_project_name") as string
    ).split("$$xXseparatorXx$$");

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
      shipType: r.get("ship_type") as ShipType,
      shipStatus: r.get("ship_status") as ShipStatus,
      wakatimeProjectNames,
      hours: r.get("hours") as number | null,
      credited_hours: r.get("credited_hours") as number | null,
      createdTime: r.get("created_time") as string,
      updateDescription: r.get("update_description") as string | null,
      reshippedFromId,
      reshippedToId,
    };
    ships.push(projectRecord);
  });

  // Now we'll create ship chains for each Wakatime project
  const shipChains = new Map<string, string[]>();

  // Step 1: Get all unique Wakatime project names across all ships
  const allWakatimeProjectNames = new Set<string>();
  ships.forEach((ship) => {
    ship.wakatimeProjectNames.forEach((wpn) => {
      allWakatimeProjectNames.add(wpn);
    });
  });
  console.info("Step 1: All Wakatime project names:", allWakatimeProjectNames);

  // Step 2: For each Wakatime project name, find the root ship and build its chain
  allWakatimeProjectNames.forEach((wpn) => {
    // Find the root ship - it should be a ship that:
    // 1. Contains this Wakatime project name
    // 2. Has no reshippedFromId
    const rootShip = ships.find(
      (s) => s.wakatimeProjectNames.includes(wpn) && !s.reshippedFromId,
    );
    console.info(`Step 2: rootShip for ${wpn}: "${rootShip?.title}"`);

    if (rootShip) {
      const chain = [rootShip.id];

      let nextShip: Ship | undefined = ships.find(
        (s) => s.id === rootShip.reshippedToId,
      );
      while (nextShip) {
        if (chain.length >= 10_000) {
          const err = new Error(
            `Ship chain max got too long (rootshipId: ${rootShip.id})`,
          );
          console.error(err);
          throw err;
        }

        if (nextShip.shipType === "project") {
          const err = new Error(
            `There's a project ship (${nextShip.id}) in the middle of (rootshipId: ${rootShip.id}) ship chain!`,
          );
          console.error(err);
          throw err;
        }

        if (chain.includes(nextShip.id)) {
          const err = new Error(
            `Circular ship chain reference detected in (rootshipId: ${rootShip.id}) ship chain (${nextShip.id} was detected twice)`,
          );
          console.error(err);
          throw err;
        }

        chain.push(nextShip.id);
        nextShip = ships.find((s) => s.id === nextShip?.reshippedToId);
      }

      shipChains.set(wpn, chain);
    } else {
      console.error("No rootship for", wpn);
    }
  });

  // Update hours for staged ships
  for (const ship of ships) {
    console.log(`RAW HOURS: ${ship.id}: ${ship.total_hours}`);
    if (ship.shipStatus !== "staged") continue;

    // Sum up hours across all Wakatime projects for this ship
    const rawWakaHours = ship.wakatimeProjectNames.reduce((total, wpn) => {
      return total + (hoursForProject(wpn) ?? 0);
    }, 0);

    if (ship.shipType === "project") {
      ship.credited_hours = rawWakaHours;
    } else if (ship.shipType === "update") {
      // Get the sum of shipped hours for all Wakatime projects
      const shippedSum = ships
        .filter(
          (s) =>
            s.wakatimeProjectNames.some((wpn) =>
              ship.wakatimeProjectNames.includes(wpn),
            ) &&
            s.shipStatus === "shipped" &&
            s.id !== ship.id,
        )
        .reduce((acc, s) => acc + (s.total_hours ?? 0), 0);

      const hoursForDraftShip = rawWakaHours - shippedSum;
      console.log(`\t\t\t${ship.id} ${shippedSum} of ${rawWakaHours}`);
      ship.credited_hours = hoursForDraftShip;
    }
  }

  return { ships, shipChains };
}

export async function createShip(formData: FormData) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to submit a ship with no Slack OAuth session",
    );
    console.log(error);
    throw error;
  }

  const slackId = session.slackId;
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
    },
  );
}

// @malted: I'm confident this is secure.
export async function createShipUpdate(
  dangerousReshippedFromShipId: string,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to submit a ship with no Slack OAuth session",
    );
    console.error(error);
    throw error;
  }

  const slackId = session.slackId;
  const entrantId = await getSelfPerson(slackId).then((p) => p.id);

  // This pattern makes sure the ship data is not fraudulent
  const { ships } = await getUserShips(slackId);

  const reshippedFromShip = ships.find(
    (ship: Ship) => ship.id === dangerousReshippedFromShipId,
  );
  if (!reshippedFromShip) {
    const error = new Error("Invalid reshippedFromShipId!");
    console.error(error);
    throw error;
  }

  /* Two things are happening here.
   * Firstly, the new ship of ship_type "update" needs to be created.
   *  - This will have all the same fields as the reshipped ship.
   *  - The update_descripton will be the new entered form field though.
   *  - The reshipped_from field should have the record ID of the reshipped ship
   * Secondly, the reshipped_to field on the reshipped ship should be updated to be the new update ship's record ID.
   */

  // Step 1:
  base()(shipsTableName).create(
    [
      {
        // @ts-expect-error No overload matches this call - but it does
        fields: {
          ...shipToFields(reshippedFromShip, entrantId),
          ship_type: "update",
          update_description: formData.get("update_description"),
          reshipped_from: [reshippedFromShip.id],
        },
      },
    ],
    (err: Error, records: any) => {
      if (err) {
        console.error("createShipUpdate step 1:", err);
        throw err;
      } else if (records) {
        // Step 2
        if (records.length !== 1) {
          const error = new Error(
            "createShipUpdate: step 1 created records result length is not 1",
          );
          console.error(error);
          throw error;
        }
        const reshippedToShip = records[0];

        // Update previous ship to point reshipped_to to the newly created update record
        base()(shipsTableName).update([
          {
            id: reshippedFromShip.id,
            fields: {
              reshipped_to: [reshippedToShip.id],
              reshipped_all: [reshippedToShip, reshippedFromShip],
            },
          },
        ]);
      } else {
        console.error("AAAFAUKCSCSAEVTNOESIFNVFEINTTET🤬🤬🤬");
      }
    },
  );
}

export async function updateShip(ship: Ship) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to stage a ship with no Slack OAuth session",
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
    },
  );
}

export async function stagedToShipped(ship: Ship) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to ship a staged ship with no Slack OAuth session",
    );
    console.log(error);
    throw error;
  }

  let credited_hours;
  if (ship.wakatimeProjectName) {
    const wakatimeProjects = await getWakaSessions().then((p) => p.projects);
    credited_hours =
      wakatimeProjects.find(
        ({ key }: { key: string }) => key === ship.wakatimeProjectName,
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
          credited_hours,
          ship_time: new Date().toISOString(),
        },
      },
    ],
    (err: Error, records: any) => {
      if (err) console.error(err);
    },
  );
}

export async function deleteShip(shipId: string) {
  const session = await getSession();
  if (!session) {
    const error = new Error(
      "Tried to delete a ship with no Slack OAuth session",
    );
    console.log(error);
    throw error;
  }

  base()(shipsTableName).update(
    [
      {
        id: shipId,
        fields: {
          ship_status: "deleted",
        },
      },
    ],
    (err: Error, records: any) => {
      if (err) console.error(err);
    },
  );
}
