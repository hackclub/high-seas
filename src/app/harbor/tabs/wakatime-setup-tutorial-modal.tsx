import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import Icon from "@hackclub/icons";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  getInstallCommand,
  Os,
  osFromAgent,
  SinglePlatform,
} from "./tutorial-utils.client";
import { hasHb } from "./tutorial-utils";
import { buttonVariants } from "../../../components/ui/button";
import {
  handleEmailSubmission,
  markArrpheusReadyToInvite,
} from "../../marketing/marketing-utils";
import JSConfetti from "js-confetti";

export default function WakatimeSetupTutorialModal({
  isOpen,
  setIsOpen,
  email,
}: {
  isOpen: boolean;
  setIsOpen: any;
  email?: string;
}) {
  const [userOs, setUserOs] = useState<Os>("unknown");
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [hasRecvHb, setHasRecvHb] = useState(false);
  const [wakaKey, setWakaKey] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<any | null>(null);

  const [personRecId, setPersonRecId] = useState<string | null>(null);
  const confettiRef = useRef<JSConfetti | null>(null);

  const triggerConfetti = () => {
    confettiRef.current?.addConfetti({
      emojis: ["🌟", "✨", "💫", "🎉"],
      emojiSize: 50,
      confettiNumber: 50,
    });
  };

  const handleContinueFromModal = async () => {
    console.log("running handleContinueFromModal");
    const precid = sessionStorage.getItem("personRecordId");

    try {
      if (!precid) throw new Error("No person record ID set yet!");

      await markArrpheusReadyToInvite(precid);
      triggerConfetti();
    } catch (err) {
      console.error("Error while handling modal continue:", err);
    }
  };

  useEffect(() => {
    confettiRef.current = new JSConfetti();

    const os = osFromAgent();
    setUserOs(os);
    setShowAllPlatforms(os === "unknown");

    (async () => {
      const emailSubmissionResult = await handleEmailSubmission(email);
      if (!emailSubmissionResult) {
        console.log("Falsy emailSubmissionResult:", emailSubmissionResult);
        return;
      }

      setPersonRecId(emailSubmissionResult.personRecordId);
      sessionStorage.setItem(
        "personRecordId",
        emailSubmissionResult.personRecordId,
      );
      console.log(
        "prid test",
        emailSubmissionResult.personRecordId,
        personRecId,
        sessionStorage.getItem("personRecordId"),
      );
      setWakaKey(emailSubmissionResult.apiKey);
      setInstructions(getInstallCommand(userOs, emailSubmissionResult.apiKey));

      if (!emailSubmissionResult.username) {
        console.error("no username while trying to sign up");
        return;
      }

      while (true) {
        const hasData = await hasHb(
          emailSubmissionResult.username,
          emailSubmissionResult.apiKey,
        );
        console.log("Hb check:", hasData);
        if (hasData) {
          await handleContinueFromModal();
          setHasRecvHb(true);
          break;
        }

        await new Promise((r) => setTimeout(r, 1_000));
      }
    })();
  }, []);

  const InstallInstructions = () => (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">
          {"You're on your way to sail the seas!"}
        </h1>
        <p className="text-base mb-4">
          In order to get rewarded for your time spent coding, we need to know
          when {"you're"} coding! We will do this with an <i>arrsome</i>{" "}
          extension in your code editor!
        </p>

        {showAllPlatforms ? (
          <div>
            <SinglePlatform os={"windows"} wakaKey={wakaKey} />
            <SinglePlatform os={"macos"} wakaKey={wakaKey} />
            <SinglePlatform os={"linux"} wakaKey={wakaKey} />
            <p onClick={() => setShowAllPlatforms(false)}>nevermind</p>
          </div>
        ) : (
          <>
            <SinglePlatform os={userOs} wakaKey={wakaKey} />
            <p className="text-xs mt-1">
              Not using {userOs}?{" "}
              <span
                onClick={() => setShowAllPlatforms(true)}
                className="underline text-blue-500 cursor-pointer"
              >
                View instructions for all platforms
              </span>
            </p>
          </>
        )}

        <video
          src="/videos/Waka Setup Script.mp4"
          autoPlay
          loop
          playsInline
          className="mt-8 rounded"
        />
      </div>

      <p className="text-center mt-2 text-base">
        Waiting for the setup script to be pasted into your terminal...
        <br />
        <p className="text-sm">{personRecId}</p>
        <br />
        <Button
          className={`${buttonVariants({ variant: "outline" })}`}
          onClick={async () => {
            await handleContinueFromModal();
            setHasRecvHb(true);
          }}
        >
          or, skip for now
        </Button>
      </p>
    </>
  );

  const CheckUrEmail = () => {
    return (
      <div>
        <p className="text-3xl mb-2">Check your email!</p>
        <p>You should see an invite to the Hack Club Slack.</p>

        <img
          src="/party-orpheus.svg"
          alt="a partying dinosaur"
          className="mt-8 mx-auto w-1/2"
        />

        <Button onClick={() => setIsOpen(false)} className="float-end">
          Dismiss
        </Button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <Card
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto text-left p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {hasRecvHb ? <CheckUrEmail /> : <InstallInstructions />}
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
