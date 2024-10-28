import { LoadingSpinner } from "@/components/ui/loading_spinner";
import Ships from "./ships";
import type { Ship } from "./ship-utils";
import useLocalStorageState from "../../../../lib/useLocalStorageState";
import { useEffect } from "react";
import { getVotesRemainingForNextPendingShip } from "@/app/utils/airtable";
import Pill from "@/components/ui/pill";

const exampleShips: Ship[] = [
  {
    id: "xX_$EXAMPLESHIP$_Xx-1",
    title: "Flip Slash Sprig Game",
    repoUrl: "https://github.com/kaj07/FLIP-SLASH--sprig-",
    deploymentUrl: "https://sprig.hackclub.com/share/FNUdELr7n4CvmavQAr8d",
    screenshotUrl:
      "https://cloud-hkx2soawz-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://raw.githubusercontent.com/kaj07/FLIP-SLASH--sprig-/refs/heads/main/README.md",
    credited_hours: 8,
    voteRequirementMet: true,
    doubloonPayout: 421,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "flip slash sprig game",
    matchups_count: 0,
    hours: null,
    total_hours: null,
    createdTime: "",
    updateDescription: null,
    reshippedFromId: null,
    reshippedToId: null,
  },
  {
    id: "xX_$EXAMPLESHIP$_Xx-2",
    title: "COTL Music Player",
    repoUrl: "https://github.com/galexy727/cotl-music-player",
    deploymentUrl:
      "https://github.com/GalexY727/cotl-music-player/releases/tag/V1.0",
    screenshotUrl:
      "https://cloud-pfbh20k1i-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://raw.githubusercontent.com/GalexY727/cotl-music-player/refs/heads/main/README.md",
    credited_hours: 5,
    voteRequirementMet: true,
    doubloonPayout: 428,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "cotl music player",
    matchups_count: 0,
    hours: null,
    total_hours: null,
    createdTime: "",
    updateDescription: null,
    reshippedFromId: null,
    reshippedToId: null,
  },
  {
    id: "xX_$EXAMPLESHIP$_Xx-3",
    title: "Portoise USB Hub",
    repoUrl: "https://github.com/Beenana02/Portoise_USB_Hub",
    deploymentUrl: "https://github.com/Beenana02/Portoise_USB_Hub",
    screenshotUrl:
      "https://cloud-ma98mn299-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://raw.githubusercontent.com/Beenana02/Portoise_USB_Hub/refs/heads/main/README.md",
    credited_hours: 16,
    voteRequirementMet: true,
    doubloonPayout: 2121,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "example ship 3",
    matchups_count: 0,
    hours: null,
    total_hours: null,
    createdTime: "",
    updateDescription: null,
    reshippedFromId: null,
    reshippedToId: null,
  },
  {
    id: "xX_$EXAMPLESHIP$_Xx-4",
    title: "Skeleton Summoner Game",
    repoUrl: "https://github.com/MONKEYFACE678/Programming-Theory-Repo",
    deploymentUrl: "https://monkeyface678.itch.io/skeleton-summoner",
    screenshotUrl:
      "https://cloud-dye9ap8qa-hack-club-bot.vercel.app/0screenshot_2024-10-26_at_17.01.25_2x.png",
    readmeUrl:
      "https://raw.githubusercontent.com/MONKEYFACE678/Programming-Theory-Repo/refs/heads/main/ReadMe.txt",
    credited_hours: 11,
    voteRequirementMet: true,
    doubloonPayout: 731,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "example ship 4",
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
  console.warn(ships);
  const [voteBalance, setVoteBalance] = useLocalStorageState(
    "cache.voteBalance",
    0,
  );
  useEffect(() => {
    getVotesRemainingForNextPendingShip(session.slackId).then((balance) =>
      setVoteBalance(balance),
    );
  });

  if (!ships) {
    <LoadingSpinner />;
  } else {
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
        <Ships
          ships={ships}
          shipChains={shipChains}
          setShips={setShips}
          bareShips={false}
        />

        <div className="flex flex-col justify-center items-center mt-8">
          <h2 className="text-xl mb-2 text-blue-500">
            Here are some example projects others have submitted!
          </h2>
          <Ships
            ships={exampleShips}
            bareShips={true}
            shipChains={new Map()}
            setShips={() => {}}
          />
        </div>
      </>
    );
  }
}
