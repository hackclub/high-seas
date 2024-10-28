"use client";
import { useEffect, useRef, useState } from "react";
import WakatimeSetupTutorialModal from "@/app/harbor/tabs/wakatime-setup-tutorial-modal";

export default function EmailSubmissionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submissionTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
      }
    };
  }, []);

  const handleForm = async (formData: FormData) => {
    const emailStr = formData.get("email") as string;
    if (!emailStr) {
      alert("You need to input an email.");
      return;
    }

    setEmail(emailStr);
    setIsOpen(true);
    formRef.current?.reset();
  };

  return (
    <>
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
        <button className="px-6 py-2 text-white text-2xl disabled:opacity-50 bg-[#3852CD] rounded-xl">
          Get started →
        </button>
      </form>
      {email ? (
        <WakatimeSetupTutorialModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          email={email}
        />
      ) : null}
    </>
  );
}
