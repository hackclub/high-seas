'use server'

import { getSession, HsSession } from './auth'
import { fetchWaka } from './server/data'

const WAKA_API_KEY = process.env.WAKA_API_KEY
export interface WakaSignupResponse {
  created: boolean
  api_key: string
}

// Deprecated??
export interface WakaInfo {
  username: string
  key: string
}

// Moved
// export async function waka(): Promise<WakaInfo> {
//   return new Promise(async (resolve, reject) => {
//     const p = await person();
//     const {
//       wakatime_username,
//       wakatime_key,
//       slack_id,
//       email,
//       name,
//       preexistingUser,
//     } = p.fields;

//     if (wakatime_key && wakatime_username) {
//       const info = {
//         username: wakatime_username,
//         key: wakatime_key,
//       };
//       console.log("[waka::waka] From Airtable:", info);
//       return resolve(info);
//     }

//     const legacyKeyRaw = cookies().get("waka-key")?.value as string | undefined;
//     if (preexistingUser && slack_id && legacyKeyRaw) {
//       let legacyKey;
//       try {
//         legacyKey = JSON.parse(legacyKeyRaw);
//       } catch {
//         const error = new Error(
//           `Could not parse legacy cookie: ${legacyKeyRaw}`,
//         );
//         console.error(error);
//         throw error;
//       }

//       const info = {
//         username: slack_id,
//         key: legacyKey.api_key,
//       };
//       console.log("[waka::waka] From legacy:", info);
//       return resolve(info);
//     }

//     // Create
//     const newWakaInfo = await createWaka(email, name ?? null, slack_id ?? null);

//     // Add to person record
//     const res = await fetch(
//       `https://middleman.hackclub.com/airtable/v0/${process.env.BASE_ID}/people`,
//       {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           records: [
//             {
//               id: p.id,
//               fields: {
//                 wakatime_username: newWakaInfo.username,
//                 wakatime_key: newWakaInfo.key,
//               },
//             },
//           ],
//         }),
//       },
//     ).then((d) => d.json());

//     console.log("[waka::waka] From created:", newWakaInfo);
//     return resolve(newWakaInfo);
//   });
// }

// Deprecated
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

// Deprecated
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
  name: string | null | undefined,
  slackId: string | null | undefined,
): Promise<WakaInfo> {
  const password = crypto.randomUUID()

  // if (!slackId) {
  //   const err = new Error("No slack ID found while trying to create WakaTime");
  //   console.error(err);
  //   throw err;
  // }

  const payload = {
    location: 'America/New_York',
    email,
    password,
    password_repeat: password,
    name: name ?? 'Unkown',
    username:
      slackId ?? `$high-seas-provisional-${email.replace('+', '$plus$')}`,
  }

  const signup = await fetch('https://waka.hackclub.com/signup', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WAKA_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload),
  })

  let signupResponse: WakaSignupResponse
  try {
    signupResponse = await signup.json()
  } catch (e) {
    console.error(e)
    throw e
  }

  const { created, api_key } = signupResponse

  const username = payload.username

  return { username, key: api_key }
}

export async function getWakaSessions(interval?: string): Promise<{
  projects: { key: string; total: number }[]
}> {
  const session = await getSession()
  if (!session) throw new Error('No session found')
  const slackId = session.slackId

  const { username, key } = await fetchWaka(session)

  if (!username || !key) {
    const err = new Error(
      'While getting sessions, no waka info could be found or created',
    )
    console.error(err)
    throw err
  }

  const summaryRes = await fetch(
    `https://waka.hackclub.com/api/summary?interval=${
      interval || 'high_seas'
    }&user=${slackId}&recompute=true`,
    {
      headers: {
        // Note, this should probably just be an admin token in the future.
        Authorization: `Bearer ${key}`,
      },
    },
  )

  let summaryResJson: { projects: { key: string; total: number }[] }
  try {
    summaryResJson = await summaryRes.json()
  } catch (e) {
    console.error(e)
    throw e
  }

  return summaryResJson
}

// export async function hasRecvFirstHeartbeat(): Promise<boolean> {
//   try {
//     const session = await getSession();
//     if (!session)
//       throw new Error(
//         "No Slack OAuth session found while trying to get WakaTime sessions.",
//       );

//     const slackId = session.slackId;

//     const hasDataRes: { hasData: boolean } = await fetch(
//       `https://waka.hackclub.com/api/special/hasData/?user=${slackId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${WAKA_API_KEY}`,
//         },
//       },
//     ).then((res) => res.json());

//     return hasDataRes.hasData;
//   } catch (e) {
//     console.error(e);
//     return false;
//   }
// }

// export async function getWakaEmail(): Promise<string | null> {
//   const session = await getSession();
//   if (!session)
//     throw new Error(
//       "No Slack OAuth session found while trying to get WakaTime sessions.",
//     );

//   const slackId = session.slackId;

//   const email: { email: string | null } = await fetch(
//     `https://waka.hackclub.com/api/special/email/?user=${slackId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${WAKA_API_KEY}`,
//       },
//     },
//   ).then((res) => res.json());

//   return email.email;
// }
