"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { person } from "./airtable";

const WAKA_API_KEY = process.env.WAKA_API_KEY;
export interface WakaSignupResponse {
  created: boolean;
  api_key: string;
}

// Good
export interface WakaInfo {
  username: string;
  key: string;
}
// Good
export async function waka(): Promise<WakaInfo> {
  return new Promise(async (resolve, reject) => {
    const p = await person();
    const {
      wakatime_username,
      wakatime_key,
      slack_id,
      email,
      name,
      preexistingUser,
    } = p.fields;

    if (wakatime_key && wakatime_username) {
      const info = {
        username: wakatime_username,
        key: wakatime_key,
      };
      console.log("[waka::waka] From Airtable:", info);
      return resolve(info);
    }

    const legacyKeyRaw = cookies().get("waka-key")?.value as string | undefined;
    if (preexistingUser && slack_id && legacyKeyRaw) {
      let legacyKey;
      try {
        legacyKey = JSON.parse(legacyKeyRaw);
      } catch {
        const error = new Error(
          `Could not parse legacy cookie: ${legacyKeyRaw}`,
        );
        console.error(error);
        throw error;
      }

      const info = {
        username: slack_id,
        key: legacyKey.api_key,
      };
      console.log("[waka::waka] From legacy:", info);
      return resolve(info);
    }

    // Create
    const newWakaInfo = await createWaka(email, name ?? null, slack_id ?? null);

    // Add to person record
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
              id: p.id,
              fields: {
                wakatime_username: newWakaInfo.username,
                wakatime_key: newWakaInfo.key,
              },
            },
          ],
        }),
      },
    ).then((d) => d.json());

    console.log("[waka::waka] From created:", newWakaInfo);
    return resolve(newWakaInfo);
  });
}

// Depricated
// export async function getWaka(): Promise<WakaSignupResponse | null> {
//   let key = cookies().get("waka-key");
//   if (!key) {
//     const session = await getSession();

//     if (!session?.email)
//       throw new Error("You can't make a wakatime account without an email!");

//     await createWaka(session.email, session?.name ?? null, session?.slackId);
//     console.log("Created a wakatime account from getWaka. Session: ", session);
//     key = cookies().get("waka-key");
//     if (!key) return null;
//   }

//   return JSON.parse(key.value) as WakaSignupResponse;
// }

// Depricated
// async function setWaka(username: string, resp: WakaSignupResponse) {
//   cookies().set("waka-key", JSON.stringify(resp), {
//     secure: process.env.NODE_ENV !== "development",
//     httpOnly: true,
//   });
//   cookies().set("waka-username", JSON.stringify(username), {
//     secure: process.env.NODE_ENV !== "development",
//     httpOnly: true,
//   });
// }

// Good function
export async function createWaka(
  email: string,
  name: string | null,
  slackId: string | null,
): Promise<WakaInfo> {
  const password = crypto.randomUUID();

  const payload: any = {
    location: "America/New_York",
    email,
    password,
    password_repeat: password,
  };

  if (name) payload["name"] = name;

  if (slackId) {
    payload["username"] = slackId;
  } else {
    payload["username"] =
      `$high-seas-provisional-${email.replace("+", "$plus$")}`;
  }

  const signup = await fetch("https://waka.hackclub.com/signup", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WAKA_API_KEY}`,
    },
    body: new URLSearchParams(payload),
  });

  let signupResponse;
  try {
    signupResponse = await signup.json();
  } catch (e) {
    console.error(e);
    throw e;
  }

  const { created, api_key } = signupResponse;

  const username = payload["username"];

  return { username, key: api_key };
}

export async function getWakaSessions(): Promise<any> {
  // const waka = await getWaka();
  const { username, key } = await waka();

  if (!username || !key) {
    const err = new Error(
      "While getting sessions, no waka info could be found or created",
    );
    console.error(err);
    throw err;
  }

  const session = await getSession();
  if (!session) throw new Error("No session found");
  const slackId = session.slackId;

  const summaryRes = await fetch(
    `https://waka.hackclub.com/api/summary?interval=low_skies&user=${slackId}&recompute=true`,
    {
      headers: {
        // Note, this should probably just be an admin token in the future.
        Authorization: `Bearer ${key}`,
      },
    },
  );

  let summaryResJson;
  try {
    summaryResJson = await summaryRes.json();
  } catch (e) {
    console.error(e);
    throw e;
  }

  return summaryResJson;
}

export async function hasRecvFirstHeartbeat(): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session)
      throw new Error(
        "No Slack OAuth session found while trying to get WakaTime sessions.",
      );

    const slackId = session.slackId;

    const hasDataRes: { hasData: boolean } = await fetch(
      `https://waka.hackclub.com/api/special/hasData/?user=${slackId}`,
      {
        headers: {
          Authorization: `Bearer ${WAKA_API_KEY}`,
        },
      },
    ).then((res) => res.json());

    return hasDataRes.hasData;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function getWakaEmail(): Promise<string | null> {
  const session = await getSession();
  if (!session)
    throw new Error(
      "No Slack OAuth session found while trying to get WakaTime sessions.",
    );

  const slackId = session.slackId;

  const email: { email: string | null } = await fetch(
    `https://waka.hackclub.com/api/special/email/?user=${slackId}`,
    {
      headers: {
        Authorization: `Bearer ${WAKA_API_KEY}`,
      },
    },
  ).then((res) => res.json());

  return email.email;
}
