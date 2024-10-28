"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Shipyard from "../shipyard/shipyard";
import Battles from "../battles/battles";
import Shop from "../shop/shop";
import { useEffect } from "react";
import { getUserShips } from "../shipyard/ship-utils";
import SignPost from "../signpost/signpost";
import { getWaka } from "../../utils/waka";
import { hasRecvFirstHeartbeat, getWakaEmail } from "../../utils/waka";
import { getPersonTicketBalanceAndTutorialStatutWowThisMethodNameSureIsLongPhew } from "../../utils/airtable";
import { WakaLock } from "../../../components/ui/waka-lock";
import { tour } from "./tour";
import useLocalStorageState from "../../../../lib/useLocalStorageState";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading_spinner";
import { HsSession } from "@/app/utils/auth";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { sample, zeroMessage } from "../../../../lib/flavor";

const Balance = ({ balance }: { balance: number }) => {
  const [open, setOpen] = useState(false);
  const brokeMessage = useMemo(() => sample(zeroMessage), []);
  return (
    <Popover open={open && balance == 0} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex items-center gap-1">
          <img src="doubloon.svg" alt="doubloons" width={24} height={24} />
          <span className="mr-2">{Math.floor(balance)} Doubloons</span>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="text-sm">
          {brokeMessage} Ship something to earn more!
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function Harbor({
  currentTab,
  session,
}: {
  currentTab: string;
  session: HsSession;
}) {
  // All the content management for all the tabs goes here.
  const [myShips, setMyShips] = useLocalStorageState("cache.myShips", null);
  const [myShipChains, setMyShipChains] = useLocalStorageState(
    "cache.myShipChains",
    null,
  );

  const [wakaToken, setWakaToken] = useLocalStorageState(
    "cache.wakaToken",
    null,
  );
  const [hasWakaHb, setHasWakaHb] = useLocalStorageState(
    "cache.hasWakaHb",
    null,
  );
  const [wakaEmail, setWakaEmail] = useLocalStorageState(
    "cache.wakaEmail",
    null,
  );
  const [personTicketBalance, setPersonTicketBalance] =
    useLocalStorageState<string>("cache.personTicketBalance", "-");

  const router = useRouter();

  const handleTabChange = (newTab: string) => {
    router.push(`/${newTab}`); // Navigate to the new tab slug
  };

  useEffect(() => {
    console.log("running tabs useeffect");
    getUserShips(session.slackId).then(({ ships, shipChains }) => {
      setMyShips(ships);
      console.warn("shipchains", ships, shipChains);
      setMyShipChains(shipChains);
    });

    (async () => {
      while (!hasWakaHb) {
        console.log("Checking hb");
        hasRecvFirstHeartbeat().then((hasHb) => setHasWakaHb(hasHb));

        await new Promise((r) => setTimeout(r, 5_000));
      }
    })();

    getPersonTicketBalanceAndTutorialStatutWowThisMethodNameSureIsLongPhew(
      session.slackId,
    ).then(({ tickets, hasCompletedTutorial }) => {
      setPersonTicketBalance(tickets.toString());

      sessionStorage.setItem("tutorial", (!hasCompletedTutorial).toString());

      if (!hasCompletedTutorial) {
        tour();
      }
    });

    getWaka().then((waka) => waka && setWakaToken(waka.api_key));

    getWakaEmail().then((email) => email && setWakaEmail(email));
  }, [session]);

  // Keep ships and shipChain in sync
  useEffect(() => {
    getUserShips(session.slackId).then(({ shipChains }) =>
      setMyShipChains(shipChains),
    );
  }, [myShips]);

  useEffect(() => {}, []);

  const tabs = [
    {
      name: "📮",
      path: "signpost",
      component: (
        <SignPost
          session={session}
          wakaToken={wakaToken}
          email={wakaEmail}
          hasWakaHb={hasWakaHb}
        />
      ),
    },
    {
      name: "Shipyard",
      path: "shipyard",
      component: (
        <Shipyard
          session={session}
          ships={myShips}
          shipChains={myShipChains}
          setShips={setMyShips}
        />
      ),
      lockOnNoHb: true,
    },
    {
      name: "Wonderdome",
      path: "wonderdome",
      component: <Battles session={session} />,
      lockOnNoHb: true,
    },
    {
      name: "Shop",
      path: "shop",
      component: <Shop session={session} />,
    },
  ];

  return (
    <Tabs
      value={currentTab}
      className="flex-1 flex flex-col"
      onValueChange={handleTabChange}
    >
      <button onClick={() => tour()}>restart tour</button>
      <TabsList className="mx-2 my-2 relative">
        {tabs.map((tab) =>
          tab.name === "📮" ? (
            <TabsTrigger
              className="left-px absolute"
              key={tab.name}
              value={tab.path}
            >
              <img src="/signpost.png" width={20} alt="" />
            </TabsTrigger>
          ) : (
            <TabsTrigger key={tab.name} value={tab.path}>
              {tab.name}
            </TabsTrigger>
          ),
        )}
        <div className="right-px absolute mr-px text-green-400 text-sm">
          <Balance balance={personTicketBalance} />
        </div>
      </TabsList>
      <div className="flex-1 overflow-auto p-3" id="harbor-tab-scroll-element">
        {tabs.map((tab) => (
          <TabsContent key={tab.name} value={tab.path} className="h-full">
            {tab.lockOnNoHb && hasWakaHb !== false && hasWakaHb !== true && (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            )}
            {tab.lockOnNoHb &&
            hasWakaHb === false &&
            sessionStorage.getItem("tutorial") !== "true" ? (
              <WakaLock
                wakaOverride={() => setHasWakaHb(true)}
                wakaToken={wakaToken}
                tabName={tab.name}
              />
            ) : (
              tab.component
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
