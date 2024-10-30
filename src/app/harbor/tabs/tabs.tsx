"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Shipyard from "../shipyard/shipyard";
import Battles from "../battles/battles";
import Shop from "../shop/shop";
import { useEffect } from "react";
import { getUserShips } from "../shipyard/ship-utils";
import SignPost from "../signpost/signpost";
import { waka } from "../../utils/waka";
import { SafePerson, safePerson } from "../../utils/airtable";
import { WakaLock } from "../../../components/ui/waka-lock";
import { tour } from "./tour";
import useLocalStorageState from "../../../../lib/useLocalStorageState";
import { useRouter } from "next/navigation";
import { HsSession } from "@/app/utils/auth";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { sample, zeroMessage } from "../../../../lib/flavor";
import SetupModal from "../../utils/wakatime-setup/setup-modal";
import { hasHb } from "@/app/utils/wakatime-setup/tutorial-utils";

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
  const [personTicketBalance, setPersonTicketBalance] =
    useLocalStorageState<string>("cache.personTicketBalance", "-");
  const [hasCompletedTutorial, setHasCompletedTutorial] =
    useLocalStorageState<boolean>("cache.hasCompletedTutorial", false);
  const [showWakaSetupModal, setShowWakaSetupModal] = useState<boolean>();

  const router = useRouter();

  const handleTabChange = (newTab: string) => {
    router.push(`/${newTab}`); // Navigate to the new tab slug
  };

  // This could do with a lot of optimisation
  useEffect(() => {
    getUserShips(session.slackId).then(({ ships, shipChains }) => {
      console.log({ ships, shipChains });
      setMyShips(ships);
      setMyShipChains(shipChains);
    });

    safePerson().then(async (p: SafePerson) => {
      setPersonTicketBalance(p.settledTickets);
      setHasCompletedTutorial(p.hasCompletedTutorial);
      // sessionStorage.setItem("tutorial", (!p.hasCompletedTutorial).toString());

      console.log("safeperson:", p);
      console.log(
        `hasCompletedTutorial: ${p.hasCompletedTutorial}\nemailSubmittedOnMobile: ${p.emailSubmittedOnMobile}`,
      );

      const { username, key } = await waka();
      const hasData = await hasHb(username, key);

      if (!hasData) {
        setShowWakaSetupModal(true);
      } else if (!p.hasCompletedTutorial) {
        sessionStorage.setItem("tutorial", "true");
        tour();
      }
      /*else {
        if (!p.hasCompletedTutorial) {
          if (p.emailSubmittedOnMobile) {
            setShowWakaSetupModal(true);
          } else {
            console.warn("1 triggering tour");
            tour();
          }
        }
      }*/
    });
  }, []);

  // Keep ships and shipChain in sync
  useEffect(() => {
    getUserShips(session.slackId).then(({ shipChains }) =>
      setMyShipChains(shipChains),
    );
  }, [myShips]);

  const tabs = [
    {
      name: "📮",
      path: "signpost",
      component: (
        <SignPost
          session={session}
          wakaToken={wakaToken}
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
    <>
      <Tabs
        value={currentTab}
        className="flex-1 flex flex-col"
        onValueChange={handleTabChange}
      >
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
        <div className="flex-1 p-3" id="harbor-tab-scroll-element">
          {tabs.map((tab) => (
            <TabsContent key={tab.name} value={tab.path} className="h-full">
              {tab.component}
              {/* {tab.lockOnNoHb &&
              hasWakaHb === false &&
              sessionStorage.getItem("tutorial") !== "true" ? (
                <WakaLock
                  wakaOverride={() => setHasWakaHb(true)}
                  wakaToken={wakaToken}
                  tabName={tab.name}
                />
              ) : (
                tab.component
              )} */}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <SetupModal
        isOpen={showWakaSetupModal}
        close={() => {
          setShowWakaSetupModal(false);
          if (
            !hasCompletedTutorial &&
            sessionStorage.getItem("tutorial") !== "true"
          ) {
            console.warn("2 triggering tour");
            tour();
          }
        }}
        onHbDetect={() => {
          setHasWakaHb(true);
          setShowWakaSetupModal(false);
          if (
            !hasCompletedTutorial &&
            sessionStorage.getItem("tutorial") !== "true"
          ) {
            console.warn("3 triggering tour");
            tour();
          }
        }}
      />
    </>
  );
}
