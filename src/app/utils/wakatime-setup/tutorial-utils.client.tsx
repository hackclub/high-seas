import React from "react";
import Icon from "@hackclub/icons";
import { Button } from "../../../components/ui/button";

export type Os = "windows" | "macos" | "linux" | "unknown";
export const getInstallCommand = (platform: string, wakaKey: string) => {
  switch (platform) {
    case "windows":
      return {
        label: "Windows PowerShell",
        command: `$env:BEARER_TOKEN="${wakaKey}"; iex (curl https://hack.club/haka-install.ps1)`,
        lang: "powershell",
      };
    case "macos":
      return {
        label: "macOS Terminal",
        command: `export BEARER_TOKEN="${wakaKey}" && curl -fsSL https://hack.club/waka-setup.sh | sh`,
        lang: "bash",
      };
    case "linux":
      return {
        label: "Linux Terminal",
        command: `export BEARER_TOKEN="${wakaKey}" && curl -fsSL https://hack.club/haka-install.sh | sh`,
        lang: "bash",
      };
    default:
      return {
        label: "Unknown Platform",
        command: `export BEARER_TOKEN="${wakaKey}" && curl -fsSL https://hack.club/haka-install.sh | sh`,
        lang: "bash",
      };
  }
};

export const osFromAgent = (): Os => {
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes("win")) {
    return "windows";
  } else if (ua.includes("mac")) {
    return "macos";
  } else if (ua.includes("linux")) {
    return "linux";
  } else {
    return "unknown";
  }
};

export const SinglePlatform = ({
  os,
  wakaKey,
}: {
  os: Os;
  wakaKey: string;
}) => {
  const platform = getInstallCommand(os, wakaKey);
  return (
    <div className="w-full mt-4">
      <p className="mb-1 inline-flex items-end gap-2">
        <Icon glyph="terminal" size={26} />
        <span>Install instructions for {platform.label}</span>
      </p>
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <pre className="text-sm bg-white/20 rounded-lg p-5 overflow-x-auto w-full flex-grow relative">
          <span className="absolute left-1.5 top-0.5 text-xs opacity-40 select-none pointer-events-none">
            {platform.lang}
          </span>
          <code>{platform.command}</code>
        </pre>
        <div>
          <Button
            className="h-full w-full px-8"
            onClick={() => navigator.clipboard.writeText(platform.command)}
          >
            Copy
            <Icon glyph="copy" size={26} />
          </Button>
        </div>
      </div>
    </div>
  );
};
