"use server";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";

export default async function SignIn({
  variant = "default",
  session,
}: {
  variant: "small" | "default";
  session: any;
}) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = encodeURIComponent(`${proto}://${host}`);

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?scope=&user_scope=openid%2Cprofile%2Cemail&redirect_uri=${origin}/api/slack_redirect&client_id=${process.env.SLACK_CLIENT_ID}`;

  const textSize = variant === "small" ? "text-base" : "text-2xl";
  return (
    <Link
      className={`bg-green-400 text-white p-2 px-6 w-fit rounded-lg ${textSize} linkPop`}
      href={session ? "/signpost" : slackAuthUrl}
    >
      {session ? "Enter the keep" : "Sign in with Hack Club Slack"}
    </Link>
  );
}
