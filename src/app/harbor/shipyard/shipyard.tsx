import Ships from "./ships";
import useLocalStorageState from "../../../../lib/useLocalStorageState";
import { useEffect } from "react";
import { getVotesRemainingForNextPendingShip } from "@/app/utils/airtable";
import Pill from "@/components/ui/pill";

const isTutorial = sessionStorage.getItem("tutorial") === "true";
const tutorialShips: Ship[] = [
  {
    id: "hack-club-site",
    title: "Hack Club Site",
    repoUrl: "https://github.com/hackclub/site",
    deploymentUrl: "https://hackclub.com",
    screenshotUrl:
      "https://cloud-lezyvcdxr-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://raw.githubusercontent.com/hackclub/site/refs/heads/main/README.md",
    credited_hours: 123,
    voteRequirementMet: false,
    doubloonPayout: 421,
    shipType: "project",
    shipStatus: "staged",
    wakatimeProjectNames: ["hack-club-site"],
    matchups_count: 0,
    hours: null,
    total_hours: null,
    createdTime: "",
    updateDescription: null,
    reshippedFromId: null,
    reshippedToId: null,
  },
];

export default function Shipyard({
  ships,
  shipChains,
  setShips,
  session,
}: any) {
  const [voteBalance, setVoteBalance] = useLocalStorageState(
    "cache.voteBalance",
    0,
  );
  useEffect(() => {
    getVotesRemainingForNextPendingShip(session.slackId).then((balance) =>
      setVoteBalance(balance),
    );
  });

  if (!ships) return;

  return (
    <>
      <div className="text-center text-white">
        <h1 className="font-heading text-5xl mb-6 text-center relative w-fit mx-auto">
          The Shipyard
          <span
            className="absolute text-sm animate-pulse mb-6 rotate-[-15deg] inline-block text-yellow-500 minecraft w-full pointer-events-none"
            style={{ textShadow: "#404100 3px 3px", translate: "-6em 1.5em" }}
          >
            Manage yer ships!
          </span>
        </h1>
      </div>
      {voteBalance > 0 && (
        <div className="w-fit mx-auto">
          <Pill
            msg={`A project is pending until you vote on ${voteBalance} more matchup(s) in the Wonderdome!`}
            color="red"
            glyph="important"
            id={""}
          />
        </div>
      )}
      {isTutorial ? (
        <Ships
          ships={tutorialShips}
          shipChains={shipChains}
          setShips={setShips}
          bareShips={false}
        />
      ) : (
        <Ships
          ships={ships}
          shipChains={shipChains}
          setShips={setShips}
          bareShips={false}
        />
      )}
    </>
  );
}
