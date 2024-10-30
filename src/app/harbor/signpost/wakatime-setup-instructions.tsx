import React, { useState, useEffect } from "react";
import JaggedCard from "@/components/jagged-card";
import Pill from "@/components/ui/pill";
import Icon from "@hackclub/icons";
import Image from "next/image";
import DoubloonsImage from "/public/doubloon.svg";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import WakaTimeConfigTabs from "./wakatime-config-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { getWakaEmail } from "../../utils/waka";

export default function WakatimeSetupInstructions({
  session,
  wakaToken,
  startsOpen = true,
}: {
  session: any;
  wakaToken: string | null;
  startsOpen: boolean;
}) {
  const [open, setOpen] = useState(startsOpen);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getWakaEmail().then(setEmail);
  }, []);

  return (
    <JaggedCard>
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
            <p className="m-0 opacity-80">Step 1</p>
            <p className="m-0 text-xl">{"Let's set up Hackatime!"}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "fit-content" }}
            exit={{ height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <Card className="mt-3 p-2">
              <p>
                Low Skies tracks your time spent coding, which factors into how
                many
                <Pill
                  msg="Doubloons"
                  color="green"
                  glyphImage={
                    <Image src={DoubloonsImage} alt="Doubloons" height={20} />
                  }
                />{" "}
                you get when your projects are voted on in the{" "}
                <Link href="/wonderdome" className="text-blue-500">
                  Wonderdome
                </Link>{" "}
                by other Hack Clubbers.{" "}
                <Pill
                  msg="Doubloons"
                  color="green"
                  glyphImage={
                    <Image src={DoubloonsImage} alt="Doubloons" height={20} />
                  }
                />{" "}
                can be exchnged for items in the{" "}
                <Link href="/shop" className="text-blue-500">
                  Shop
                </Link>
                .
              </p>
              <br />
              <p>
                Low Skies uses the WakaTime VSCode extension to track how much
                time you spend on your projects. Specifically,
                <Link
                  target="_blank"
                  className="text-blue-500"
                  href="https://waka.hackclub.com"
                >
                  {" "}
                  a Hack Clubber-forked open source version
                </Link>
                .
              </p>
              <br />
              <p>
                {"Let's set up WakaTime! First, install the "}
                <Link
                  href="https://wakatime.com/vs-code"
                  className="text-blue-500"
                >
                  VS Code extension
                </Link>
                . Next, we need to edit the configuration file to put in our
                WakaTime token (to identify you), and a custom URL (to tell the
                extension to send the data it collects to Low Skies).
              </p>
              <br />

              <p>
                Your WakaTime config (located at <code>~/.wakatime.cfg</code>)
                needs to be exactly this;
              </p>
              <Card className="p-2">
                <pre className="text-left">
                  <code>
                    {wakaToken ? (
                      <>
                        [settings]
                        <br />
                        api_url = https://waka.hackclub.com/api
                        <br />
                        api_key = {wakaToken}
                      </>
                    ) : (
                      "loading..."
                    )}
                  </code>
                </pre>
              </Card>
              <br />
              <p>
                {"If you know what you're doing, go ahead and paste that in. "}
                Alternatively, you can run this script in your terminal!
              </p>
              {wakaToken ? <WakaTimeConfigTabs wakaToken={wakaToken} /> : null}
              <br />
              <p>
                To log in to the dashboard, your username is your Slack ID (
                <code>{session ? session?.slackId : "???"}</code>), and your
                email is <code>{email ? email : "???"}</code>. {"You'll"} need
                to request a password reset link (unless {"you've"} already
                signed up for Hackatime!)
              </p>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </JaggedCard>
  );
}
