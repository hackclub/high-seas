import Icon from "@hackclub/icons";
import React, { useEffect, useState } from "react";
import {
  Os,
  osFromAgent,
  SinglePlatform,
} from "../../app/harbor/tabs/tutorial-utils.client";
import { Button, buttonVariants } from "./button";

const WakaLock = ({ wakaOverride, wakaToken, tabName }) => {
  const [userOs, setUserOs] = useState<Os>("unknown");
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  useEffect(() => {
    const os = osFromAgent();
    setUserOs(os);
    setShowAllPlatforms(os === "unknown");
  }, []);

  return (
    <div className="text-white flex flex-col items-center mx-auto w-full max-w-2xl max-h-[80vh] overflow-y-auto text-left p-4">
      <Icon glyph="private-outline" width={64} height={64} />

      <p>Waiting for Hackatime install...</p>

      {showAllPlatforms ? (
        <>
          <SinglePlatform os={"windows"} wakaKey={wakaToken} />
          <SinglePlatform os={"macos"} wakaKey={wakaToken} />
          <SinglePlatform os={"linux"} wakaKey={wakaToken} />
          <p
            className="text-xs mt-1 underline cursor-pointer"
            onClick={() => setShowAllPlatforms(false)}
          >
            Hide other platforms
          </p>
        </>
      ) : (
        <>
          <SinglePlatform os={userOs} wakaKey={wakaToken} />
          <p
            className="text-xs mt-1 underline cursor-pointer"
            onClick={() => setShowAllPlatforms(true)}
          >
            Not using {userOs}? View instructions for other platforms.
          </p>
        </>
      )}

      <video
        src="/videos/Waka Setup Script.mp4"
        autoPlay
        loop
        playsInline
        className="my-8 rounded w-3/4"
      />
      <Button
        className={`w-3/4 ${buttonVariants({ variant: "outline" })}`}
        onClick={() => wakaOverride()}
      >
        Skip for now
      </Button>
    </div>
  );
};
export { WakaLock };
