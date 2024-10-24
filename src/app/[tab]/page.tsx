import React from "react";
import { redirect, notFound } from "next/navigation";
import Harbour from "../harbour/tabs/tabs";
import { getSession } from "../utils/auth";
import { Card } from "@/components/ui/card";
import { SoundButton } from "../../components/sound-button.js";

export default async function Page({ params }: { params: { tab: string } }) {
  const { tab } = params;
  const validTabs = ["signpost", "the-keep", "thunderdome", "shop"];
  if (!validTabs.includes(tab)) return notFound();
  const session = await getSession();
  if (!session) return redirect("/");

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
      <div className="w-full min-h-screen pt-14 flex items-start justify-center p-8">
        <SoundButton />
        <Card className="w-full max-w-4xl flex flex-col" type={"cardboard"}>
          <Harbour session={session} currentTab={tab} />
        </Card>
      </div>
    </>
  );
}
