import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { type Ship, stagedToShipped } from "./ship-utils";
import Image from "next/image";
import Icon from "@hackclub/icons";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/components/markdown";
import { Button, buttonVariants } from "@/components/ui/button";
import NewShipForm from "./new-ship-form";
import EditShipForm from "./edit-ship-form";
import { getSession, type HsSession } from "@/app/utils/auth";
import Link from "next/link";

import ShipPillCluster from "@/components/ui/ship-pill-cluster";
import NoImgDino from "/public/no-img-dino.png";
import NoImgBanner from "/public/no-img-banner.png";
import ReadmeHelperImg from "/public/readme-helper.png";
import NewUpdateForm from "./new-update-form";

export default function Ships({
  ships,
  shipChains = new Map(),
  bareShips = false,
  setShips,
}: {
  ships: Ship[];
  shipChains: Map<string, string[]>;
  bareShips: boolean;
  setShips: any;
}) {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [previousSelectedShip, setPreviousSelectedShip] = useState<Ship | null>(
    null
  );

  const [readmeText, setReadmeText] = useState<string | null>(null);
  const [newShipVisible, setNewShipVisible] = useState(false);
  const [newUpdateShip, setNewUpdateShip] = useState<Ship | null>(null);
  const [session, setSession] = useState<HsSession | null>(null);
  const [isEditingShip, setIsEditingShip] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    getSession().then((sesh) => setSession(sesh));
  }, []);

  useEffect(() => {
    setSelectedShip((s: Ship | null) => {
      if (!s) return null;
      return ships.find((x) => x.id === s.id) || null;
    });
  }, [ships]);

  useEffect(() => {
    // I.e. if the user has just edited a ship
    if (previousSelectedShip && selectedShip) return;

    // Only invalidate the README text when you go from <<ship selected>> to <<no ship selected>>
    if (!selectedShip) {
      setReadmeText(null);
      setIsEditingShip(false);
    }

    if (selectedShip) {
      fetchReadme();
    }

    setPreviousSelectedShip(selectedShip);
  }, [selectedShip, previousSelectedShip]);

  const fetchReadme = async () => {
    if (selectedShip && !readmeText) {
      try {
        const text = await fetch(selectedShip.readmeUrl).then((d) => d.text());
        setReadmeText(text);
      } catch (error) {
        console.error("Failed to fetch README:", error);
        setReadmeText("?");
      }
    }
  };

  const stagedShips = ships.filter(
    (ship: Ship) => ship.shipStatus === "staged"
  );
  const shippedShips = ships.filter(
    (ship: Ship) => ship.shipStatus === "shipped" && ship.shipType === "project"
  );

  const shipMap = new Map();
  for (const s of ships) {
    shipMap.set(s.id, s);
  }

  // let selectedProjectWakatimeProjectShipChain;

  // if (selectedShip) {
  //   try {
  //     selectedProjectWakatimeProjectShipChain = shipChains.get(
  //       selectedShip.wakatimeProjectName,
  //     );
  //   } catch (e) {
  //     console.error("err with selectedProjectWakatimeProjectShipChain: ", e);
  //   }
  // }

  const SingleShip = ({
    s,
    id,
    setNewShipVisible,
  }: {
    s: Ship;
    id: string;
    setNewShipVisible: any;
  }) => (
    <div
      key={s.id}
      id={id}
      onClick={() => setSelectedShip(s)}
      className="cursor-pointer"
    >
      <Card className="flex flex-col sm:gap-2 sm:flex-row items-start sm:items-center p-4 hover:bg-gray-100 transition-colors duration-200">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 relative mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
            <img
              src={s.screenshotUrl}
              alt={`Screenshot of ${s.title}`}
              className="object-cover w-full h-full absolute top-0 left-0 rounded"
              onError={({ target }) => {
                target.src = NoImgDino.src;
              }}
            />
          </div>
          <h2 className="text-xl font-semibold text-left mb-2 sm:hidden block">
            {s.title}
          </h2>
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-semibold text-left mb-2 sm:block hidden">
            {s.title}
          </h2>

          <div className="flex flex-wrap items-start gap-2 text-sm">
            <ShipPillCluster ship={s} shipChains={shipChains} />
          </div>
        </div>

        {bareShips ? null : (
          <div className="mt-4 sm:mt-0 sm:ml-auto">
            {s.shipStatus === "staged" ? (
              <Button
                id="ship-ship"
                onClick={async (e) => {
                  e.stopPropagation();
                  console.log("Shipping", s);
                  await stagedToShipped(s);
                  location.reload();
                }}
              >
                SHIP SHIP!
              </Button>
            ) : (
              <Button
                onClick={async (e) => {
                  e.stopPropagation();
                  console.log("Shipping an update...", s);
                  setNewUpdateShip(s);
                  // await stagedToShipped(s);
                  // location.reload();
                }}
              >
                Ship an update!
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed w-screen h-screen left-0 top-0 pointer-events-none"
      />

      {bareShips ? null : (
        <motion.div
          className="w-fit mx-auto mb-0 mt-3"
          whileHover={{ rotate: "-5deg", scale: 1.02 }}
        >
          <Button
            className="text-xl text-white"
            style={{ background: "#D236E2" }}
            id="start-ship-draft"
            onClick={() => setNewShipVisible(true)}
          >
            Draft a new Ship!
          </Button>
        </motion.div>
      )}

      {stagedShips.length === 0 ? null : (
        <div className={`w-full mt-8`}>
          {bareShips ? null : (
            <h2 className="text-center text-2xl mb-2 text-blue-500">
              Draft Ships
            </h2>
          )}

          <div id="staged-ships-container" className="space-y-4">
            {stagedShips.map((ship: Ship, idx: number) => (
              <SingleShip
                s={ship}
                key={ship.id}
                id={`staged-ship-${idx}`}
                setNewShipVisible={setNewShipVisible}
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full relative">
        {shippedShips.length > 0 ? (
          <div className={`space-y-4 ${bareShips ? "" : "mt-8"}`}>
            {bareShips ? null : (
              <h2 className="text-center text-2xl text-blue-500">
                Shipped Ships
              </h2>
            )}

            {shippedShips.map((ship: Ship, idx: number) => (
              <SingleShip
                s={ship}
                key={ship.id}
                id={`shipped-ship-${idx}`}
                setNewShipVisible={setNewShipVisible}
              />
            ))}
          </div>
        ) : null}

        {shippedShips.length < 1 && stagedShips.length < 1 ? (
          <>
            <div className="text-white mx-auto w-fit flex absolute -left-28 right-0 -top-28 pointer-events-none">
              <img src="/curly-arrow.svg" alt="" width="64" />
              <div className="flex flex-col justify-between">
                <p></p>
                <p className="-translate-x-3 translate-y-2">
                  Ship your first project!
                </p>
              </div>
            </div>
            <div className="mt-24"></div>
          </>
        ) : null}
      </div>

      <AnimatePresence>
        {newShipVisible && session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full z-50 bg-black bg-opacity-50"
            onClick={() => setNewShipVisible(false)}
          >
            <Card
              className="relative w-full max-w-2xl mx-auto mt-16"
              onClick={(e) => e.stopPropagation()}
            >
              <NewShipForm
                id="new-ship-form-container-card"
                ships={ships}
                canvasRef={canvasRef}
                closeForm={() => setNewShipVisible(false)}
                session={session}
              />

              <motion.button
                className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md z-20"
                onClick={() => setNewShipVisible(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon glyph="view-close" />
              </motion.button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newUpdateShip && session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setNewUpdateShip(null)}
          >
            <Card
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <NewUpdateForm
                shipToUpdate={newUpdateShip}
                canvasRef={canvasRef}
                closeForm={() => setNewUpdateShip(null)}
                session={session}
              />

              <motion.button
                className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md z-20"
                onClick={() => setNewUpdateShip(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon glyph="view-close" />
              </motion.button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedShip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="selected-ship-card-parent"
            className="absolute inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setSelectedShip(null)}
          >
            {/* <div className="min-h-screen px-4 pt-32 pb-20">
              <div className="flex justify-center">
                <motion.div
                  className="w-full max-w-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card
                    id="new-ship-form-container-card"
                    className="relative w-full"
                  > */}
            <motion.div
              className="w-full max-w-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card
                className="relative w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 right-0 h-48 z-10">
                  <Image
                    src={selectedShip.screenshotUrl}
                    alt={`Screenshot of ${selectedShip.title}`}
                    className="object-cover max-w-full"
                    fill={true}
                    priority
                    unoptimized
                    sizes="4rem"
                    onError={({ target }) => {
                      target.src = NoImgBanner.src;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                </div>

                <div
                  className="overflow-y-auto flex-grow pt-48"
                  id="selected-ship-card"
                >
                  <CardHeader className="relative">
                    <h2 className="text-3xl font-bold">{selectedShip.title}</h2>
                    <p className="opacity-50">
                      {selectedShip.wakatimeProjectName ? (
                        `Wakatime project name: ${selectedShip.wakatimeProjectName}`
                      ) : (
                        <div className="flex items-center gap-1">
                          <Icon glyph="important" />
                          No Wakatime project name!
                        </div>
                      )}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex flex-row gap-3 h-12">
                        <Link
                          id="selected-ship-play-button"
                          className="flex items-center flex-grow"
                          target="_blank"
                          href={selectedShip.deploymentUrl || "#"}
                          prefetch={false}
                        >
                          <Button
                            className="w-full h-full"
                            disabled={!selectedShip.deploymentUrl}
                          >
                            Play
                            <Icon glyph="view-forward" />
                          </Button>
                        </Link>
                        <Link
                          id="selected-ship-repo-button"
                          target="_blank"
                          className={`${buttonVariants({
                            variant: "outline",
                          })} h-full`}
                          href={selectedShip.repoUrl}
                          prefetch={false}
                        >
                          <Icon glyph="github" /> GitHub Repo
                        </Link>

                        <Button
                          id="selected-ship-edit-button"
                          className={`${buttonVariants({
                            variant: "outline",
                          })} w-fit p-2 h-full text-black`}
                          onClick={() => setIsEditingShip((p) => !p)}
                        >
                          <Icon glyph="edit" width={24} /> Edit
                        </Button>
                      </div>

                      <AnimatePresence>
                        {isEditingShip && selectedShip && (
                          <motion.div
                            key="edit-ship-form"
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "fit-content",
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <Card className="p-2 mt-2 bg-neutral-100">
                              <EditShipForm
                                ship={selectedShip}
                                closeForm={() => setIsEditingShip(false)}
                                setShips={setShips}
                              />
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div className="flex items-center gap-4 mt-4">
                        <ShipPillCluster
                          ship={selectedShip}
                          shipChains={shipChains}
                        />
                      </motion.div>

                      {/* {bareShips ? null : (
                        <div>
                          <hr className="my-5" />
                          <h3>Ship update chain</h3>
                          <ol className="flex flex-col">
                            {selectedProjectWakatimeProjectShipChain ? (
                              selectedProjectWakatimeProjectShipChain.map(
                                (shipChainId: string, shipChainIdx: number) => {
                                  const foundShip = ships.find(
                                    (s: Ship) => s.id === shipChainId,
                                  );

                                  if (!foundShip)
                                    return (
                                      <p key={shipChainIdx}>
                                        {
                                          "selectedProjectWakatimeProjectShipChain -> foundShip is None"
                                        }
                                      </p>
                                    );

                                  return (
                                    <li
                                      className={`inline-flex items-center gap-3 ${shipChainIdx === 0 ? "" : "ml-7"}`}
                                      key={shipChainIdx}
                                    >
                                      {shipChainIdx === 0 ? (
                                        <Icon glyph="home" />
                                      ) : (
                                        <Icon
                                          glyph="reply"
                                          style={{
                                            transform: "scaleX(-1) scaleY(-1)",
                                          }}
                                        />
                                      )}
                                      <span>
                                        {foundShip.title} ({foundShip.shipType})
                                      </span>
                                      <span className="text-sm opacity-50">
                                        {foundShip.shipType === "update"
                                          ? foundShip.updateDescription
                                          : null}
                                      </span>
                                      <span className="text-sm opacity-50">
                                        {ago(foundShip.createdTime)}
                                      </span>
                                    </li>
                                  );
                                },
                              )
                            ) : (
                              <p>wat</p>
                            )}
                          </ol>
                        </div>
                      )} */}

                      {selectedShip.shipType === "update" ? (
                        <>
                          <hr className="my-5" />
                          <div>
                            <h3 className="text-xl">Update description</h3>
                            <p>{selectedShip.updateDescription}</p>
                          </div>
                        </>
                      ) : null}

                      <hr className="my-5" />

                      {readmeText ? (
                        <div className="prose max-w-none">
                          {readmeText === "?" ? (
                            <div className="p-2 text-center">
                              <p>RAHHHH! You entered a bad README URL.</p>
                              <p className="text-xs">
                                Bestie you gotta click <code>Raw</code> on your
                                README and then copy the URL
                                <br />
                                (it should start with{" "}
                                <code>raw.githubusercontent.com</code> and end
                                in <code>.md</code>)
                              </p>
                              <Image
                                src={ReadmeHelperImg}
                                alt=""
                                width={400}
                                height={100}
                                className="mx-auto object-cover mt-2"
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="text-xl">Main Project README</h3>
                              <ReactMarkdown
                                components={markdownComponents}
                                rehypePlugins={[rehypeRaw]}
                              >
                                {readmeText}
                              </ReactMarkdown>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-center">Loading README...</p>
                      )}
                    </div>
                  </CardContent>
                </div>

                <motion.button
                  className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md z-20"
                  onClick={() => setSelectedShip(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon glyph="view-close" />
                </motion.button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
