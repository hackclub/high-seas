"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Shipyard from "../shipyard/shipyard";
import Battles from "../battles/battles";
import Shop from "../shop/shop";
import { useEffect } from "react";
import { getUserShips, Ship } from "../shipyard/ship-utils";
import { JwtPayload } from "jsonwebtoken";
import SignPost from "../signpost/signpost";
import { getWaka } from "../../utils/waka";
import { hasRecvFirstHeartbeat, getWakaEmail } from "../../utils/waka";
import { getPersonTicketBalance } from "../../utils/airtable";
import { WakaLock } from "../../../components/ui/waka-lock.js";

import useLocalStorageState from "../../../../lib/useLocalStorageState";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading_spinner";

export default function Harbour({
  currentTab,
  session,
}: {
  currentTab: string;
  session: JwtPayload;
}) {
  // All the content management for all the tabs goes here.
  const [myShips, setMyShips] = useLocalStorageState<Ship[] | null>(
    "cache.myShips",
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

  const handleTabChange = (newTab) => {
    router.push(`/${newTab}`); // Navigate to the new tab slug
  };

  useEffect(() => {
    getUserShips(session.payload.sub).then((ships) => setMyShips(ships));

    hasRecvFirstHeartbeat().then((hasHb) => setHasWakaHb(hasHb));

    getPersonTicketBalance(session.payload.sub).then((balance) =>
      setPersonTicketBalance(balance.toString()),
    );

    getWaka().then((waka) => waka && setWakaToken(waka.api_key));

    getWakaEmail().then((email) => email && setWakaEmail(email));
  }, [session]);

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
      name: "The Keep",
      path: "the-keep",
      component: (
        <Shipyard session={session} ships={myShips} setShips={setMyShips} />
      ),
      lockOnNoHb: true,
    },
    {
      name: "Thunderdome",
      path: "thunderdome",
      component: <Battles session={session} />,
      lockOnNoHb: true,
    },
    {
      name: "Shoppe",
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
          <div className="flex items-center gap-1">
            <img src="scales.svg" alt="scales" width={24} height={24} />
            <span className="mr-2">{personTicketBalance} Scales</span>
          </div>
        </div>
      </TabsList>
      <div className="flex-1 overflow-auto p-3" id="harbour-tab-scroll-element">
        {tabs.map((tab) => (
          <TabsContent key={tab.name} value={tab.path} className="h-full">
            {tab.lockOnNoHb && hasWakaHb !== false && hasWakaHb !== true && (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            )}
            {tab.lockOnNoHb && hasWakaHb === false && (
              <WakaLock
                wakaOverride={() => setHasWakaHb(true)}
                wakaToken={wakaToken}
                tabName={tab.name}
              />
            )}
            {(!tab.lockOnNoHb || hasWakaHb) && tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
