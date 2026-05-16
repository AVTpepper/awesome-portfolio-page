"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import type { SiteSettings } from "@/lib/types";

export async function updateSiteSettings(data: Partial<SiteSettings>) {
  await verifyAdminSession();
  await adminDb.collection("settings").doc("site").set(data, { merge: true });
  revalidatePath("/");
}
