import JaggedCard from "@/components/jagged-card";
import Link from "next/link";
interface VerificationProps {
  status: string;
  reason: string;
}

const getVerificationMessage = (status: string, reason: string) => {
  switch (status) {
    default:
      return {
        color: "orange",
        message:
          "Oh no, you haven't filled out a verification form yet! But… how did you even get to this page then?? That's not supposed to be possible… please make a post to #high-seas-help 🤔",
        // redirect: true,
      };
    case "Unknown":
      return {
        color: "yellow",
        message:
          "Hang tight, we're still reviewing your verification documents! Don't worry, it usually takes less than day. In the meantime, get hacking! Your hours still count as long as you've installed Hackatime.",
      };
    case "Insufficient":
      return {
        color: "orange",
        message: (
          <>
            Blimey! We weren't able to verify you with the proof you submitted
            According to the reviewer {reason}. Don't feed the fish though!{" "}
            <Link
              href="https://forms.hackclub.com/eligibility"
              className="underline"
            >
              Try again here
            </Link>
            . Email{" "}
            <a href="mailto:verifications@hackclub.com" className="underline">
              verifications@hackclub.com
            </a>{" "}
            if you have any questions.
          </>
        ),
      };
    case "Ineligible":
      return {
        color: "red",
        message: (
          <>
            Uh-oh, seems like you're an adult… unfortunately, High Seas is only
            for teenagers 18 and under. Email{" "}
            <a href="mailto:verifications@hackclub.com" className="underline">
              verifications@hackclub.com
            </a>{" "}
            if you think this is a misunderstanding.
          </>
        ),
      };
    // case "Eligible L1":
    // case "Eligible L2":
    //     return {
    //         color: "green",
    //         message: "Eyyyy, you got verified! That's great. However, the devs should really just not show this banner for verified users… no sense telling everyone they're verified until the end of time 🤷‍♂️",
    //     };
  }
};

export default function Verification({ status, reason }: VerificationProps) {
  const verificationStatus = status;
  const { color, message, redirect } = getVerificationMessage(
    verificationStatus,
    reason,
  );

  if (
    verificationStatus === "Eligible L1" ||
    verificationStatus === "Eligible L2"
  ) {
    return null;
  }

  return (
    <JaggedCard bgColor={color}>
      <div
        className={`py-1 px-3 text-white ${
          color === "yellow" || color === "orange" ? "text-black" : "text-white"
        }`}
      >
        <p>{message}</p>
        {redirect && (
          <Link
            href="https://forms.hackclub.com/eligibility"
            className="underline"
          >
            Verify Yourself!
          </Link>
        )}
      </div>
    </JaggedCard>
  );
}
