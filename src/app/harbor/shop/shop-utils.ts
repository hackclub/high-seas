"use server";

import Airtable from "airtable";
import { getSession } from "@/app/utils/auth";
import { getSelfPerson } from "@/app/utils/airtable";
import {NextResponse} from "next/server";

const base = () => {
  const baseId = process.env.BASE_ID;
  if (!baseId) throw new Error("No Base ID env var set");

  return Airtable.base(baseId);
};

export interface ShopItem {
  id: string;
  name: string;
  subtitle: string | null;
  imageUrl: string | null;
  enabledUs: boolean | null;
  enabledEu: boolean | null;
  enabledIn: boolean | null;
  enabledXx: boolean | null;
  enabledCa: boolean | null;
  priceUs: number;
  priceGlobal: number;
  fulfilledAtEnd: boolean;
  comingSoon: boolean;
  outOfStock: boolean;
}

export async function getPerson(){
  const session = await getSession();
  if (!("slackId" in session)) {
    return
  }
  const person = await getSelfPerson(session.slackId);
  if (!person) {
    return NextResponse.json(
        { error: "i don't even know who you are" },
        {status: 418}
    );
  }

}
export async function getShop(): Promise<ShopItem[]> {
  const items: ShopItem[] = [];

  const session = await getSession();
  if (!("slackId" in session)) {
    return
  }
  const person = await getSelfPerson(session.slackId);

  return new Promise((resolve, reject) => {
    base()("shop_items")
      .select({
        filterByFormula: person.fields.academy_completed ? "{enabled_main_game}" : "{enabled_high_seas}",
        sort: [{ field: "tickets_us", direction: "asc" }],
      })
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            items.push({
              id: record.get("identifier") as string,
              name: record.get("name") as string,
              subtitle: record.get("subtitle") as string | null,
              imageUrl: record.get("image_url") as string | null,
              enabledUs: Boolean(record.get("enabled_us")) as boolean,
              enabledEu: Boolean(record.get("enabled_eu")) as boolean,
              enabledIn: Boolean(record.get("enabled_in")) as boolean,
              enabledXx: Boolean(record.get("enabled_xx")) as boolean,
              enabledCa: Boolean(record.get("enabled_ca")) as boolean,
              priceUs: Number(record.get("tickets_us")) as number,
              priceGlobal: Number(record.get("tickets_global")) as number,
              fulfilledAtEnd: Boolean(record.get("fulfilled_at_end")) as boolean,
              comingSoon: Boolean(record.get("coming_soon")) as boolean,
              outOfStock: Boolean(record.get("out_of_stock")) as boolean,
            });
          });

          fetchNextPage();
        },
        (err) => (err ? reject(err) : resolve(items)),
      );
  });

  //
  // return new Promise((resolve, reject) => {
  //   base()("shop").select({
  //     // filterByFormula: `SEARCH('${personId}', {entrant})`,
  //     // view: "Grid view",
  //   });

  // .eachPage(
  //   (records, fetchNextPage) => {
  //     records.forEach((record) => {
  //       const entrant = record.get("entrant") as string[];
  //       if (entrant && entrant.includes(personId)) {
  //         ships.push({
  //           id: record.get("id") as string,
  //           title: record.get("title") as string,
  //           repoUrl: record.get("repo_url") as string,
  //           readmeUrl: record.get("readme_url") as string,
  //           screenshotUrl: record.get("screenshot_url") as string,
  //           rating: record.get("rating") as number,
  //           hours: record.get("hours") as number,
  //         });
  //       }
  //     });
  //     fetchNextPage();
  //   },
  //   (err) => (err ? reject(err) : resolve(ships)),
  // );
  // });
}
