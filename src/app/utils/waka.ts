"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "./auth";

const WAKA_API_KEY = process.env.WAKA_API_KEY;
export interface WakaSignupResponse {
  created: boolean;
  api_key: string;
}

export async function getWaka(): Promise<WakaSignupResponse | null> {
  let key = cookies().get("waka-key");
  if (!key) {
    await createWaka();
    key = cookies().get("waka-key");
    if (!key) return null;
  }

  return JSON.parse(key.value) as WakaSignupResponse;
}

async function setWaka(resp: WakaSignupResponse) {
  console.log("setting waka key: ", resp);

  cookies().set("waka-key", JSON.stringify(resp), {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
  });

  console.log("set the waka key!", cookies().get("waka-key"));
}

const errRedir = (err: any) => redirect("/slack-error?err=" + err.toString());

async function createWaka() {
  const newSession = await getSession();
  if (!newSession) return errRedir("No session was set");

  const slackId: string = newSession.payload.sub;
  if (!slackId) return errRedir("No Slack ID in session OpenID payload");

  const slackEmail: string = newSession.payload.email;
  if (!slackEmail) return errRedir("No Slack email in session OpenID payload");

  const slackDisplayName: string = newSession.payload.name;
  if (!slackDisplayName)
    return errRedir("No Slack display name in session OpenID payload");

  const password = crypto.randomUUID();
  const signup = await fetch("https://waka.hackclub.com/signup", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WAKA_API_KEY}`,
    },
    body: new URLSearchParams({
      location: "America/New_York",
      username: slackId,
      name: slackDisplayName,
      email: slackEmail,
      password: password,
      password_repeat: password,
    }),
  });

  const signupResponse = await signup.json();

  console.log("created a new wakatime token: ", signupResponse);

  await setWaka(signupResponse);
}

export async function getWakaSessions(): Promise<any> {
  const waka = await getWaka();
  if (!waka) {
    const err = new Error(
      "While getting sessions, no waka session could be found or created",
    );
    console.error(err);
    throw err;
  }

  const session = await getSession();
  if (!session)
    throw new Error(
      "No Slack OAuth session found while trying to get WakaTime sessions.",
    );

  const slackId = session.payload.sub;

  const summaryRes = await fetch(
    // TODO: this date needs to change dynamically and can't be too far in the future
    `https://waka.hackclub.com/api/summary?interval=low_skies&user=${slackId}&recompute=true`,
    {
      headers: {
        Authorization: `Bearer ${WAKA_API_KEY}`,
      },
    },
  );

  return await summaryRes.json();
}

export async function hasRecvFirstHeartbeat(): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session)
      throw new Error(
        "No Slack OAuth session found while trying to get WakaTime sessions.",
      );

    const slackId = session.payload.sub;

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

  const slackId = session.payload.sub;

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
