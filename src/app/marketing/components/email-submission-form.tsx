"use client";
import React, { useEffect, useRef, useState } from "react";
import WakatimeSetupTutorialModal from "@/app/harbor/tabs/wakatime-setup-tutorial-modal";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import Icon from "@hackclub/icons";
import Modal from "../../../components/ui/modal";

export default function EmailSubmissionForm() {
  const [email, setEmail] = useState<string>();
  const [errorText, setErrorText] = useState<string>();
  const [t, sT] = useState<Timer>();
  const formRef = useRef<HTMLFormElement>(null);

  const handleForm = async (formData: FormData) => {
    const emailStr = (formData.get("email") as string).trim();

    if (t) {
      clearTimeout(t);
      sT(undefined);
    }

    if (!emailStr) {
      setErrorText("You need to enter an email.");
      sT(
        setTimeout(() => {
          setErrorText(undefined);
          formRef.current?.reset();
        }, 2_500),
      );
      return;
    } else if (!validEmail(emailStr)) {
      setErrorText("You need to enter a valid email.");
      sT(
        setTimeout(() => {
          setErrorText(undefined);
          formRef.current?.reset();
        }, 2_500),
      );
      return;
    }

    setEmail(emailStr);
  };

  return (
    <>
      <div className="flex flex-col">
        <form
          ref={formRef}
          action={handleForm}
          className="flex flex-wrap text-xl md:text-xl justify-center items-center rounded-xl gap-2"
        >
          <input
            type="text"
            name="email"
            placeholder="name@email.com"
            className="px-6 py-2 rounded-lg text-md border-2 border-[#3852CD]"
          />
          <Button
            // disabled={buttonDisabled}
            className="px-6 py-2 text-2xl h-full disabled:opacity-50 bg-[#3852CD] rounded-lg text-white"
          >
            Get started <Icon glyph="enter" />
          </Button>
        </form>

        <AnimatePresence>
          {errorText ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "fit-content" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 border-2 border-[#3852CD] bg-[#3852CD] px-4 py-2 rounded-lg text-white"
            >
              {errorText}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={!!email}
        close={() => setEmail(undefined)}
        hideCloseButton={true}
      >
        <WakatimeSetupTutorialModal
          email={email}
          closeModal={() => setEmail(undefined)}
        />
      </Modal>
    </>
  );
}

export const validEmail = (email: string): boolean =>
  !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
