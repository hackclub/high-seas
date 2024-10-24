import { hasRecvFirstHeartbeat } from "../../utils/waka";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import WakatimeSetupInstructions from "./wakatime-setup-instructions";
import KeyPlacesInstructions from "./key-places-instructions";

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
  useEffect(() => {
    hasRecvFirstHeartbeat().then((a) =>
      console.log("has recv first heartbeat:", a),
    );
  }, []);

  const motionProps = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }),
    [],
  );

  return (
    <motion.div
      {...motionProps}
      className="container mx-auto px-4 py-8 max-w-prose"
    >
      <h1 className="font-heading text-5xl font-bold text-blue-500 mb-6 text-center">
        Welcome to the signpost
      </h1>

      <div className="space-y-2">
        <WakatimeSetupInstructions
          session={session}
          wakaToken={wakaToken}
          email={email}
          startsOpen={!hasWakaHb}
        />
        <KeyPlacesInstructions />
      </div>

      <p className="mt-4 text-center">
        Have questions? Need help? Reach out to us in{" "}
        <a
          className="text-blue-500"
          href="https://hackclub.slack.com/archives/C07PZNMBPBN"
        >
          #low-skies-help
        </a>
        !
      </p>
    </motion.div>
  );
}
