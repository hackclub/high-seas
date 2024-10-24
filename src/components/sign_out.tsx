"use client";

import { Button, buttonVariants } from "./ui/button";

export default function SignOut() {
  const handleOnClick = () => {
    localStorage.removeItem("cache.wakaToken");
    localStorage.removeItem("cache.hasWakaHb");
    localStorage.removeItem("cache.wakaEmail");
  };

  return (
    <a onClick={handleOnClick} href="/signout" className="block">
      <Button className={buttonVariants({ variant: "outline" })}>
        Sign out
        <span className="hidden lg:block">&nbsp;of Hack Club Slack</span>
      </Button>
    </a>
  );
}
