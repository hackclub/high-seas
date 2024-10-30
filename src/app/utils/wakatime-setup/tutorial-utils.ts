"use server";

import { getSession } from "../../utils/auth";

export async function hasHb(username: string, key: string): Promise<boolean> {
  if (!username)
    throw new Error("Username is undefined while checking waka hasData");

  const res = await fetch(
    `https://waka.hackclub.com/api/special/hasData?user=${username}`,
    { headers: { Authorization: `Bearer ${process.env.WAKA_API_KEY}` } },
  );
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(
      `Error while checking ${username}'s waka hasData: ${txt}`,
    );
    console.error(err);
    throw err;
  }

  const resJson = await res.json();
  return resJson.hasData === true;
}

export async function markAcademyComplete() {
  const session = await getSession();
  if (!session) throw new Error("Mark academy complete not worky! :(");

  const res = await fetch(
    `https://api.airtable.com/v0/appTeNFYcUiYfGcR6/people`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            id: session.personId,
            fields: { academy_completed: true },
          },
        ],
      }),
    },
  ).then((d) => d.json());
  console.log("RSNOTOESRNTESRNTITSRTF##33", res);
}
