import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { deleteSession } from "../utils/auth";

export async function GET(request: NextRequest) {
  console.log("SIGNING OUT!!!!!!");
  await deleteSession();
  return redirect("/");
}
