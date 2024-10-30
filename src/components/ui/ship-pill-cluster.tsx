import type { Ship } from "@/app/harbor/shipyard/ship-utils";
import Pill from "./pill";

import DoubloonsImage from "/public/doubloon.svg";
import Image from "next/image";

export default function ShipPillCluster({
  ship,
  shipChains,
}: {
  ship: Ship;
  shipChains: Map<string, string[]>;
}) {
  // const shipUpdates = shipChains
  //   ? shipChains.get(ship.wakatimeProjectName)
  //   : null;
  // const shipUpdateCount = shipUpdates ? shipUpdates.length - 1 : null;

  return (
    <>
      <Pill msg={`${ship.credited_hours?.toFixed(3) ?? 0} hr`} glyph="clock" />

      {ship.shipStatus === "shipped" &&
        (ship.voteRequirementMet ? (
          ship.doubloonPayout ? (
            <Pill
              msg={`${Math.floor(ship.doubloonPayout)} Doubloons`}
              color="green"
              glyphImage={<Image src={DoubloonsImage} alt="doubloons" height={20} />}
            />
          ) : (
            <Pill
              msg={`Pending: ${10 - ship.matchups_count} votes left till you get doubloons`}
              color="blue"
              glyph="event-add"
              percentage={ship.matchups_count * 10}
            />
          )
        ) : (
          <Pill msg={"Pending: Vote to unlock"} color="blue" glyph="enter" />
        ))}

      {/* {shipUpdateCount && shipUpdateCount > 0 ? (
        <Pill
          msg={`${shipUpdateCount} Ship update${shipUpdateCount === 1 ? "" : "s"}`}
          color="purple"
          glyph="reply"
          glyphStyles={{ transform: "scaleX(-1)" }}
        />
      ) : null} */}
    </>
  );
}
