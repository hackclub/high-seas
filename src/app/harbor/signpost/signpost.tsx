import { motion } from "framer-motion";
import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { getSelfPerson } from "../../utils/airtable";
import Verification from "./verification";
import useLocalStorageState from "../../../../lib/useLocalStorageState";
import Platforms from "@/app/utils/wakatime-setup/platforms";
import JaggedCard from "../../../components/jagged-card";

export default function SignPost({
  session,
  wakaToken,
  hasWakaHb,
}: {
  session: any;
  wakaToken: string | null;
  hasWakaHb: boolean | null;
}) {
  const motionProps = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }),
    [],
  );

  const [verification, setVerification] = useLocalStorageState(
    "cache.verification",
    "",
  );
  const [reason, setReason] = useLocalStorageState("cache.reason", "");

  useEffect(() => {
    getSelfPerson(session.slackId).then((data) => {
      setVerification(
        data?.["fields"]?.["verification_status"]?.[0]?.toString() || "",
      );
      setReason(data?.["fields"]?.["Rejection Reason"] || "");
    });
  }, [session.slackId]);

  return (
    <motion.div
      {...motionProps}
      className="container mx-auto px-4 py-8 max-w-prose"
    >
      <h1 className="font-heading text-5xl font-bold text-white mb-6 text-center">
        The Signpost
      </h1>
      <Verification status={verification} reason={reason} />

      {/* <div className="space-y-2">

        <WakatimeSetupInstructions
          session={session}
          wakaToken={wakaToken}
          startsOpen={!hasWakaHb}
        />
        <KeyPlacesInstructions />
      </div> */}

      <JaggedCard className="text-white">
        {wakaToken ? (
          <Platforms wakaKey={wakaToken} />
        ) : (
          <p>Loading Hackatime token...</p>
        )}
      </JaggedCard>

      <p className="mt-4 text-center text-white">
        Have questions? Need help? Reach out to us in{" "}
        <Link
          className="text-blue-500"
          href="https://hackclub.slack.com/archives/C07PZNMBPBN"
        >
          #high-seas-help
        </Link>
        !
      </p>
    </motion.div>
  );
}
