"use server";

import { getWakaSessions } from "@/app/utils/waka";

export async function wakaSessions() {
  return await getWakaSessions();
}
