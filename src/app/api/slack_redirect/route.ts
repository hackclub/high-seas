import {
  getRedirectUri,
  getSession,
  createSlackSession,
} from "@/app/utils/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const errRedir = (err: any) => redirect("/slack-error?err=" + err.toString());

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  const redirectUri = await getRedirectUri();

  const exchangeUrl = `https://slack.com/api/openid.connect.token?code=${code}&client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&redirect_uri=${redirectUri}`;
  console.log("exchanging by posting to", exchangeUrl);

  const res = await fetch(exchangeUrl, { method: "POST" });

  if (res.status !== 200) return errRedir("Bad Slack OpenId response status");

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error(e, await res.text());
    throw e;
  }
  if (!data || !data.ok) {
    console.error(data);
    return errRedir("Bad Slack OpenID response");
  }

  try {
    await createSlackSession(data.id_token);
    console.log("cretaed slack session!! :)))))");
  } catch (e) {
    return errRedir(e);
  }

  // const userInfoUrl = `https://slack.com/api/openid.connect.userInfo`;
  // const userInfo = await fetch(userInfoUrl, {
  //   headers: { Authorization: `Bearer ${data.access_token}` },
  // }).then((d) => d.json());

  redirect("/signpost");
}
