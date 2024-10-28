"use client";

import { notFound } from "next/navigation";
import Harbor from "../harbor/tabs/tabs";
import { createMagicSession, getSession } from "../utils/auth";
import { Card } from "@/components/ui/card";
import { SoundButton } from "../../components/sound-button.js";
import { useEffect, useState } from "react";

export default function Page({
  params,
  searchParams,
}: {
  params: { tab: string };
  searchParams: any;
}) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then((s) => {
      if (s) {
        setSession(s);
      } else {
        window.location.pathname = "/?msg='Oi oi oi, you can't be going there'";
      }
    });
  }, []);

  const { tab } = params;
  const validTabs = ["signpost", "shipyard", "wonderdome", "shop"];
  if (!validTabs.includes(tab)) return notFound();

  const { magic_auth_token } = searchParams;

  if (magic_auth_token) {
    console.info("maigc auth token:", magic_auth_token);
    // First check for is_full_user, if so, redirect to slack auth
    // const person =

    createMagicSession(magic_auth_token).then(
      () => (window.location.href = window.location.pathname),
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: "url(/bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="w-full min-h-screen pt-14 flex items-start justify-center p-4">
        <SoundButton />
        <Card className="w-full max-w-4xl flex flex-col" type={"cardboard"}>
          {session ? (
            <Harbor session={session} currentTab={tab} />
          ) : (
            <p className="text-center">Session is loading...</p>
          )}
        </Card>
      </div>
    </>
  );
}
