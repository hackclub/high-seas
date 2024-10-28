import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading_spinner";
import { sample, shopBanner } from "../../../../lib/flavor.js";
import { useState, useEffect } from "react";
import { getShop, ShopItem } from "./shop-utils";
import useLocalStorageState from "../../../../lib/useLocalStorageState.js";
import { HsSession } from "@/app/utils/auth.js";

import { ShopItemComponent } from "./shop-item-component.js";
import { ShopkeeperComponent } from "./shopkeeper.js";

export default function Shop({ session }: { session: HsSession }) {
  const [filterIndex, setFilterIndex] = useLocalStorageState(
    "shop.country.filter",
    0,
  );
  const [shopItems, setShopItems] = useLocalStorageState<ShopItem[] | null>(
    "cache.shopItems",
    null,
  );
  const [personTicketBalance] = useLocalStorageState<string>(
    "cache.personTicketBalance",
    "-",
  );

  const [bannerText, setBannerText] = useState("");
  const verificationStatus = /*session.verificationStatus[0] ||*/ "Eligible L1";
  const slackId = session.slackId;
  const isTutorial = sessionStorage.getItem("tutorial");
  useEffect(() => {
    setBannerText(sample(shopBanner));
    getShop().then((shop) => setShopItems(shop));
  }, []);

  if (!shopItems) {
    return (
      <motion.div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </motion.div>
    );
  }

  const filters = {
    "0": (x: any) => {
      return true;
    },
    "1": (item: any) => item.enabledUs,
    "2": (item: any) => item.enabledEu,
    "3": (item: any) => item.enabledIn,
    "4": (item: any) => item.enabledCa,
    "5": (item: any) => item.enabledXx,
  };
  const getFilter = () => {
    // @ts-expect-error reason reason reason
    return filters[filterIndex.toString()] || filters["0"];
  };

  const onOptionChangeHandler = (e) => {
    setFilterIndex(e.target.value);
  };

  return (
    <motion.div className="container mx-auto px-4 py-8 text-white">
      <div className="text-center text-white">
        <h1 className="font-heading text-5xl mb-6 text-center relative w-fit mx-auto">
          Pirate Shop
        </h1>
        <p className="text-xl animate-pulse mb-6 rotate-[-7deg] inline-block">
          {bannerText}
        </p>
        <ShopkeeperComponent />
      </div>
      <div className="text-center mb-6 mt-12" id="region-select">
        <label>pick a region to buy something!</label>
        <select
          onChange={onOptionChangeHandler}
          value={filterIndex}
          className="text-gray-600"
        >
          <option value="0">️🏴‍☠️ all across the 7 seas</option>
          <option value="1">🇺🇸 US</option>
          <option value="2">🇪🇺 EU + 🇬🇧 UK</option>
          <option value="3">🇮🇳 India</option>
          <option value="4">🍁 Canada</option>
          <option value="5">🗺 other countries worldwide...</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.filter(getFilter()).map((item: any) => {
          if(item.id == "item_free_stickers_41" && !isTutorial) return null
          return (<ShopItemComponent
            id={item.id}
            key={item.id}
            item={item}
            filterIndex={filterIndex}
            personTicketBalance={personTicketBalance}
          />
        )})}
      </div>
    </motion.div>
  );
}
