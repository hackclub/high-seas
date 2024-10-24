import { LoadingSpinner } from "@/components/ui/loading_spinner";
import Ships from "./ships";
import type { Ship } from "./ship-utils";
import useLocalStorageState from "../../../../lib/useLocalStorageState";
import { useEffect } from "react";
import { getVotesRemainingForNextPendingShip } from "@/app/utils/airtable";
import Pill from "@/components/ui/pill";

const exampleShips: Ship[] = [
  {
    id: "example_ship_1",
    title: "Flip Slash Sprig Game",
    repoUrl: "https://github.com/kaj07/FLIP-SLASH--sprig-",
    deploymentUrl: "https://sprig.hackclub.com/share/FNUdELr7n4CvmavQAr8d",
    screenshotUrl:
      "https://cloud-hkx2soawz-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://raw.githubusercontent.com/kaj07/FLIP-SLASH--sprig-/refs/heads/main/README.md",
    hours: 8.184,
    voteRequirementMet: true,
    doubloonPayout: 421,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "flip slash sprig game",
  },
  {
    id: "example_ship_2",
    title: "COTL Music Player",
    repoUrl: "https://github.com/galexy727/cotl-music-player",
    deploymentUrl:
      "https://github.com/GalexY727/cotl-music-player/releases/tag/V1.0",
    screenshotUrl:
      "https://cloud-pfbh20k1i-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://github.com/GalexY727/cotl-music-player/blob/main/README.md",
    hours: 5.195,
    voteRequirementMet: true,
    doubloonPayout: 428,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "cotl music player",
  },
  {
    id: "example_ship_3",
    title: "Portoise USB Hub",
    repoUrl: "https://github.com/Beenana02/Portoise_USB_Hub",
    deploymentUrl: "",
    screenshotUrl:
      "https://cloud-ma98mn299-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://github.com/Beenana02/Portoise_USB_Hub/blob/main/README.md",
    hours: 15.994,
    voteRequirementMet: true,
    doubloonPayout: 2121,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "example ship 3",
  },
  {
    id: "example_ship_4",
    title: "Skeleton Summoner Game",
    repoUrl: "https://github.com/MONKEYFACE678/Programming-Theory-Repo",
    deploymentUrl: "",
    screenshotUrl:
      "https://cloud-j29zpdbig-hack-club-bot.vercel.app/0image.png",
    readmeUrl:
      "https://github.com/MONKEYFACE678/Programming-Theory-Repo/blob/main/ReadMe.txt",
    hours: 11.018,
    voteRequirementMet: true,
    doubloonPayout: 731,
    shipType: "project",
    shipStatus: "shipped",
    wakatimeProjectName: "example ship 4",
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
    getVotesRemainingForNextPendingShip(session.payload.sub).then((balance) =>
      setVoteBalance(balance),
    );
  });

  if (!ships) {
    <LoadingSpinner />;
  } else {
    return (
      <div>
        <div className="text-center">
          <h1 className="font-heading text-5xl font-bold text-blue-500 mb-6 text-center relative w-fit mx-auto">
            The Keep
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
              msg={`A project is pending until you vote on ${voteBalance} more matchup(s) in the Thunderdome!`}
              color="red"
              glyph="important"
            />
          </div>
        )}
        <Ships ships={ships} shipChains={shipChains} setShips={setShips} />

        <div className="flex flex-col justify-center items-center mt-8">
          <h2 className="text-xl mb-2 text-blue-500">
            Here are some example projects others have submitted!
          </h2>
          <Ships ships={exampleShips} bareShips={true} />
        </div>
      </div>
    );
  }
}
