import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/server";

export type ActivityAction = "create" | "update" | "delete";
export type ActivityCollection = "projects" | "testimonials" | "services" | "settings";

export async function logActivity(
  action: ActivityAction,
  collection: ActivityCollection,
  docId: string,
  label: string,
): Promise<void> {
  try {
    await adminDb.collection("admin-activity").add({
      action,
      collection,
      docId,
      label,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Non-fatal: activity logging must never block the main operation
    console.error("[activity] Failed to log activity:", error);
  }
}
