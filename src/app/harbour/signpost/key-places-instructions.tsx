import JaggedCard from "@/components/jagged-card";
import Pill from "@/components/ui/pill";
import Icon from "@hackclub/icons";
import Image from "next/image";
import { useState } from "react";
import ScalesImage from "/public/scales.svg";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const keyLocations = [
  {
    title: "The Keep",
    subtitle: <p>{"Submit your projects here when they're done!"}</p>,
    path: "/the-keep",
  },
  {
    title: "Thunderdome",
    subtitle: (
      <p>
        Vote between projects others have made! After submitting your project,
        you must vote between project matchups in order to earn{" "}
        <Pill
          msg="Scales"
          color="green"
          glyphImage={<Image src={ScalesImage} alt="scales" height={20} />}
        />
        . Note that the number of{" "}
        <Pill
          msg="Scales"
          color="green"
          glyphImage={<Image src={ScalesImage} alt="scales" height={20} />}
        />{" "}
        you earn is based on the number of hours you have put in your own
        project, and how it competes against other projects. Everything is peer
        voted!
      </p>
    ),
    path: "/thunderdome",
  },
  {
    title: "Shoppe",
    subtitle: (
      <p>
        Spend all your{" "}
        <Pill
          msg="Scales"
          color="green"
          glyphImage={<Image src={ScalesImage} alt="scales" height={20} />}
        />{" "}
        here! Get items, ranging from Blahajs to Yubikeys. More items to come in
        the future!
      </p>
    ),
    path: "/shop",
  },
];

export default function WakatimeSetupInstructions() {
  const [open, setOpen] = useState(true);

  return (
    <JaggedCard className="flex flex-col">
      <div className="flex gap-2 items-center">
        <motion.div animate={{ rotate: open ? 0 : -90 }}>
          <Icon
            glyph="down-caret"
            color="white"
            size={42}
            onClick={() => setOpen((p) => !p)}
          />
        </motion.div>
        <div>
          <div
            className="text-white"
            style={{ "-webkit-user-select": "none", userSelect: "none" }}
          >
            <p className="m-0 opacity-80">Step 2</p>
            <p className="m-0 text-xl">{"Visit the key locations"}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, marginTop: "0" }}
            animate={{ height: "auto", marginTop: "1rem" }}
            exit={{ height: 0, marginTop: "0" }}
            className="overflow-y-clip"
          >
            <div className="mx-auto space-y-3">
              {keyLocations.map((location) => (
                <motion.a
                  key={location.path}
                  whileHover={{ scale: 0.9, rotate: "-1deg" }}
                  href={location.path}
                  className="block"
                >
                  <Card className="p-2 text-left">
                    <p className="text-xl">{location.title}</p>

                    {location.subtitle}
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </JaggedCard>
  );
}
