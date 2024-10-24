import Icon from "@hackclub/icons";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WakaLock = ({ wakaOverride, wakaToken, tabName }) => {
  const { toast } = useToast();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-lg text-center gap-4">
      <Icon glyph="private-outline" width={42} />
      <p>
        {"We haven't seen any "}
        <Link
          className="text-blue-500"
          href={"https://waka.hackclub.com"}
        >
          WakaTime
        </Link>{" "}
        activity from you yet.
        <br />
        {tabName} will unlock once we see you{"'"}ve set it up.
        Once you{"'"}ve been coding for a couple of minutes,
        refresh this page. If you have already used hackatime dm{" "}
        <a href="https://hackclub.slack.com/team/U062UG485EE">
          @krn
        </a>{" "}
        and he will migrate your account :)
      </p>

      <Button
        onClick={() => {
          navigator.clipboard.writeText(wakaToken);
          toast({
            title: "Copied WakaTime token",
            description: wakaToken,
          });
        }}
      >
        Copy WakaTime token
      </Button>

      <Button
        className={`text-black ${buttonVariants({ variant: "outline" })}`}
        onClick={() => wakaOverride()}
      >
        Skip WakaTime setup requirement
      </Button>
    </div>
  )
}
export { WakaLock }