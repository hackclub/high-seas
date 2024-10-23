"use server";

import { getSession } from "@/app/utils/auth";
import SignOut from "./sign_out";
import SignIn from "./sign_in";
import Image from "next/image";
import Logo from "/public/logo.png";
import Flag from "/public/flag-orpheus-top.svg";
import { Card } from "./ui/card";
import Steps from "./steps";

export default async function Nav() {
  const session = await getSession();

  return (
    <Card className="fixed flex items-center justify-between top-0 left-0 right-0 h-14 px-8 m-2 bg-neutral-100 z-10 drop-shadow-lg">
      <div className="flex gap-3 items-center">
        <Image
          src={Flag}
          alt="hack club"
          height={54}
          className="hidden lg:block"
        />
        <Image src={Logo} alt="low skies" height={48} />
      </div>

      {/* <div className="">
        <Steps />
      </div> */}

      <div className="flex gap-4 items-center text-nowrap">
        {session ? (
          <div className="flex gap-2 items-center">
            <Image
              src={session.payload.picture}
              width={32}
              height={32}
              alt="profile picture"
              className="rounded-full"
            />
            <p className="hidden lg:block">
              Hey, {session.payload.given_name}!
            </p>{" "}
          </div>
        ) : null}
        {session ? <SignOut /> : <SignIn variant="small" session={session} />}
      </div>
    </Card>
  );
}
