"use server";

import { sign, decode, verify, JwtPayload } from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { getPersonBySlackId } from "../../../lib/battles/airtable";

const vars = () => {
  const authSecret = process.env.AUTH_SECRET;
  const cookieName = process.env.SLACK_AUTH_COOKIE_NAME;

  if (!authSecret) throw new Error("Env AUTH_SECRET is not set");
  if (!cookieName) throw new Error("Env SLACK_AUTH_COOKIE_NAME is not set");

  return { authSecret, cookieName };
};

export async function setSession(slack_openid_token: string) {
  console.log("setting token");

  const { authSecret, cookieName } = vars();

  const decoded = decode(slack_openid_token, { complete: true });
  if (!decoded) throw new Error("Failed to decode the Slack OpenId JWT");

  const signedToken = sign(decoded, authSecret, { expiresIn: "7d" });
  cookies().set(cookieName, signedToken, {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  console.log("set the token!", cookies().get(cookieName), getSession());
}

export async function getSession(): Promise<JwtPayload | null> {
  const { authSecret, cookieName } = vars();

  const cookie = cookies().get(cookieName);
  if (!cookie) return null;

  const payload = verify(cookie.value, authSecret, {
    complete: true,
    algorithms: ["HS256"],
  }).payload as JwtPayload;
  const person = await getPersonBySlackId(payload.payload.sub);
  payload.verificationStatus = person?.verification_status ?? "unverified";
  return payload;
}

export async function deleteSession() {
  cookies().delete(vars().cookieName);
  cookies().delete("waka-key");
}

export async function getRedirectUri(): Promise<string> {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const uri = encodeURIComponent(`${proto}://${host}/api/slack_redirect`);

  return uri;
}
