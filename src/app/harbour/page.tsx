"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Shipyard from "./shipyard/shipyard";
import Battles from "./battles/battles";
import Shop from "./shop/shop";
import { useEffect, useState } from "react";
import { ShopItem, getShop } from "./shop/shop-utils";
// import Map from "./map/map";
import { getUserShips, Ship } from "./shipyard/ship-utils";
import { /*Gallery,*/ ShipsObject } from "./gallery/gallery";
import { JwtPayload } from "jsonwebtoken";
import SignPost from "./signpost/signpost";
import { getWaka } from "../utils/waka";
import Image from "next/image";
import SignpostImage from "/public/signpost.png";
import { hasRecvFirstHeartbeat } from "../utils/waka";
import Icon from "@hackclub/icons";
import Link from "next/link";
import { getPersonTicketBalance } from "../utils/airtable";

import scales from "/public/scales.svg";

export default function Harbour({ session }: { session: JwtPayload }) {
  // All the content management for all the tabs goes here.
  const [myShips, setMyShips] = useState<Ship[] | null>(null);
  const [galleryShips, setGalleryShips] = useState<ShipsObject>({});
  const [shopItems, setShopItems] = useState<ShopItem[] | null>(null);
  const [wakaToken, setWakaToken] = useState<string | null>(null);
  const [hasWakaHb, setHasWakaHb] = useState(false);
  const [personTicketBalance, setPersonTicketBalance] = useState<string>("-");
  const { toast } = useToast();

  useEffect(() => {
    getUserShips(session.payload.sub).then((ships) => setMyShips(ships));

    getShop().then((shop) => setShopItems(shop));

    hasRecvFirstHeartbeat().then((hasHb) => setHasWakaHb(hasHb));

    getPersonTicketBalance(session.payload.sub).then((balance) =>
      setPersonTicketBalance(balance.toString()),
    );

    getWaka().then((waka) => waka && setWakaToken(waka.api_key));
  }, []);

  const tabs = [
    {
      name: "📮",
      component: <SignPost session={session} wakaToken={wakaToken} />,
    },
    {
      name: "The Keep",
      component: <Shipyard ships={myShips} />,
      lockOnNoHb: true,
    },
    { name: "Thunderdome", component: <Battles />, lockOnNoHb: true },
    // {
    //   name: "Gallery",
    //   component: <Gallery ships={galleryShips} setShips={setGalleryShips} />,
    // },
    // { name: "Map", component: <Map /> },
    { name: "Shoppe", component: <Shop items={shopItems} /> },
  ];

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        backgroundImage: "url(/bgoverlay.svg)",
        backgroundSize: "cover",
        // backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full h-full flex items-center justify-center p-8"
      >
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          <Tabs
            defaultValue="📮"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-2 my-2 relative">
              {tabs.map((tab) =>
                tab.name === "📮" ? (
                  <TabsTrigger
                    className="left-px absolute"
                    key={tab.name}
                    value={tab.name}
                  >
                    <Image src={SignpostImage} width={20} alt="" />
                  </TabsTrigger>
                ) : (
                  <TabsTrigger key={tab.name} value={tab.name}>
                    {tab.name}
                  </TabsTrigger>
                ),
              )}
              <div className="right-px absolute mr-2 text-green-400">
                <div className="flex flex-row">
                  <Image src={scales} alt="scales" width={25} height={25} />
                  <span className="mr-2">{personTicketBalance} Scales</span>
                </div>
              </div>
            </TabsList>
            <div
              className="flex-1 overflow-auto p-3"
              id="harbour-tab-scroll-element"
            >
              {tabs.map((tab) => (
                <TabsContent key={tab.name} value={tab.name} className="h-full">
                  {tab.lockOnNoHb && !hasWakaHb ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-lg text-center gap-4">
                      <Icon glyph="private-outline" width={42} />
                      <p>
                        {"We haven't seen any "}
                        <Link
                          className="text-blue-500"
                          href={"https://waka.hackclub.com"}
                        >
                          WakaTime
                        </Link>{" "}
                        activity from you yet.
                        <br />

                        {tab.name} will unlock once we see you{"'"}ve set it up!
                        If you have already used hackatime dm{" "}
                        <a href="https://hackclub.slack.com/team/U062UG485EE">
                          @krn
                        </a>{" "}
                        and he will migrate your acount :)
                      </p>

                      <Button
                        disabled={!wakaToken}
                        onClick={() => {
                          navigator.clipboard.writeText(wakaToken!);
                          toast({
                            title: "Copied WakaTime token",
                            description: wakaToken,
                          });
                        }}
                      >
                        Copy WakaTime token
                      </Button>

                      <Button
                        className={`text-black ${buttonVariants({ variant: "outline" })}`}
                        onClick={() => setHasWakaHb(true)}
                      >
                        Skip WakaTime setup requirement
                      </Button>
                    </div>
                  ) : (
                    tab.component
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
