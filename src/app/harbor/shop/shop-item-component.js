import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { cantAffordWords, purchaseWords, sample } from "../../../../lib/flavor";

const ActionArea = ({ item, filterIndex, affordable }) => {
  const buyWord = useMemo(() => sample(purchaseWords), [item.id]);
  const getYourRacksUp = useMemo(() => sample(cantAffordWords), [item.id]);

  if (filterIndex == 0) {
    return <Button disabled={true}>pick a region to buy!</Button>;
  }
  if (item.comingSoon) {
    return <Button disabled={true}>🕑 coming soon...</Button>;
  }
  if (item.outOfStock) {
    return <Button disabled={true}>out of stock...</Button>;
  }
  if (!affordable) {
    return <Button disabled={true}>💸 {getYourRacksUp}</Button>;
  }
  return (
    <form action={`/api/buy/${item.id}`} className="w-full">
      <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 text-3xl enchanted">
        {buyWord}
      </Button>
    </form>
  );
};

export const ShopItemComponent = ({
  item,
  filterIndex,
  personTicketBalance,
  id,
}) => {
  const cardHoverProps = {
    whileHover: {
      scale: 1.05,
    },
  };

  return (
    <motion.div {...cardHoverProps}>
      <Card
        id={id}
        className="h-full flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-center">
              {item.name}
            </CardTitle>
          </div>
          <hr />
          <p
            className="text-sm text-gray-600 mt-1"
            dangerouslySetInnerHTML={{ __html: item.subtitle ?? "" }}
          ></p>

          <span className="text-green-500 font-semibold flex items-center">
            <img
              src="doubloon.svg"
              alt="doubloons"
              width={20}
              height={20}
              className="mr-1"
            />
            {filterIndex == 1 ? item.priceUs : item.priceGlobal}
          </span>
        </CardHeader>
        {item.imageUrl && (
          <CardContent className="p-0 flex-grow">
            <div className="h-48 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </CardContent>
        )}
        <CardFooter className="pt-4">
          <ActionArea
            item={item}
            filterIndex={filterIndex}
            affordable={
              (filterIndex == 1 ? item.priceUs : item.priceGlobal) <=
              parseInt(personTicketBalance)
            }
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
};
