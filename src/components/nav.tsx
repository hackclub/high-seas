"use server";

import { getSession } from "@/app/utils/auth";
import SignOut from "./sign_out";
import SignIn from "./sign_in";
import Image from "next/image";
import Logo from "/public/logo.png";
import Link from "next/link";
import { Card } from "./ui/card";

export default async function Nav() {
  const session = await getSession();

  return (
    <Card className="fixed flex items-center justify-between top-0 left-0 right-0 h-14 px-2 m-2 bg-neutral-100 z-30 drop-shadow-lg">
      <a href="/">
        <Image src={Logo} alt="low skies" height={48} />
      </a>

      <div className="flex gap-4 items-center text-nowrap">
        {session && session.picture && session.givenName ? (
          <div className="flex gap-2 items-center">
            <Image
              src={session.picture}
              width={32}
              height={32}
              alt="profile picture"
              className="rounded-full"
            />
            <p className="hidden lg:block">Hey, {session.givenName}!</p>{" "}
          </div>
        ) : null}
        {session ? (
          <>
            <SignOut />
          </>
        ) : (
          <SignIn variant="small" session={session} />
        )}
      </div>
    </Card>
  );
}
