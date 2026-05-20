"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import { logActivity } from "@/lib/firebase/activity";
import type { SiteSettings } from "@/lib/types";

export async function updateSiteSettings(data: Partial<SiteSettings>) {
  await verifyAdminSession();
  await adminDb.collection("settings").doc("site").set(data, { merge: true });
  void logActivity("update", "settings", "site", "Site Settings");
  revalidatePath("/");
  revalidatePath("/projects");
}
