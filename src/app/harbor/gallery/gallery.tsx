"use client";

import { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { getShips } from "./utils";
import { Ship } from "../shipyard/ship-utils";
import Ships from "../shipyard/ships";

export type ShipsObject = Record<string, Ship>;

export default function Gallery({ ships, setShips }: any) {
  const [nextOffset, setNextOffset] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShips = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const newShipInfo = await getShips(nextOffset);
      setNextOffset(newShipInfo.offset);
      setHasMore(!!newShipInfo.offset);

      setShips((prev: any) => {
        const newShips = newShipInfo.ships.reduce(
          (acc: ShipsObject, ship: Ship) => {
            acc[ship.id] = ship;
            return acc;
          },
          {},
        );
        return { ...prev, ...newShips };
      });
    } catch (error) {
      console.error("Error fetching ships:", error);
      setHasMore(false);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, nextOffset]);

  useEffect(() => {
    if (Object.keys(ships).length === 0) {
      fetchShips();
    }
  }, []);

  if (!ships) return <p className="text-center">Loading all ships...</p>;

  const shipsArray: Ship[] = Object.values(ships);

  if (shipsArray.length === 0)
    return <p className="text-center">Loading all ships...</p>;

  return (
    <InfiniteScroll
      dataLength={shipsArray.length}
      next={fetchShips}
      hasMore={hasMore}
      loader={
        <p className="text-center mb-4">
          <b>Loading</b>
        </p>
      }
      endMessage={
        <p className="text-center mb-4">
          <b>Yay! You have seen all {shipsArray.length} ships.</b>
        </p>
      }
      scrollableTarget="harbor-tab-scroll-element"
    >
      <Ships ships={shipsArray} />
    </InfiniteScroll>
  );
}
