import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import WakatimeSetupInstructions from "./wakatime-setup-instructions";
import Link from "next/link";
import KeyPlacesInstructions from "./key-places-instructions";
import { getSelfPerson } from "../../utils/airtable";
import Verification from "./verification";
import useLocalStorageState from "../../../../lib/useLocalStorageState";

export default function SignPost({
  session,
  wakaToken,
  email,
  hasWakaHb,
}: {
  session: any;
  wakaToken: string | null;
  email: string | null;
  hasWakaHb: boolean | null;
}) {

  const motionProps = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }),
    []
  );

  const [verification, setVerification] = useLocalStorageState("cache.verification", "")
  const [reason, setReason] = useLocalStorageState("cache.reason", "")


  useEffect(() => {
    getSelfPerson(session.slackId).then((data) => {
      setVerification(data?.["fields"]?.["verification_status"]?.[0]?.toString() || "");
      setReason(data?.["fields"]?.["Rejection Reason"] || "");
    });
  }, [session.slackId]);

  return (
    <motion.div
      {...motionProps}
      className="container mx-auto px-4 py-8 max-w-prose"
    >
      <h1 className="font-heading text-5xl font-bold text-white mb-6 text-center">
        Welcome to the signpost
      </h1>

      <div className="space-y-2">
        <Verification status={verification} reason={reason} />
        <WakatimeSetupInstructions
          session={session}
          wakaToken={wakaToken}
          email={email}
          startsOpen={!hasWakaHb}
        />
        <KeyPlacesInstructions />
      </div>

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
