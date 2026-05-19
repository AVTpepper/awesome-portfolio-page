"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import { logActivity } from "@/lib/firebase/activity";
import type { Service } from "@/lib/types";

type ServiceInput = Omit<Service, "id" | "updatedAt">;

export async function createService(data: ServiceInput) {
  await verifyAdminSession();
  const ref = await adminDb.collection("services").add({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logActivity("create", "services", ref.id, data.title);
  revalidatePath("/");
}

export async function updateService(id: string, data: Partial<ServiceInput>) {
  await verifyAdminSession();
  await adminDb
    .collection("services")
    .doc(id)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  await logActivity("update", "services", id, data.title ?? "(updated)");
  revalidatePath("/");
}

export async function deleteService(id: string) {
  await verifyAdminSession();
  const doc = await adminDb.collection("services").doc(id).get();
  const label = (doc.data() as Pick<Service, "title"> | undefined)?.title ?? "(deleted)";
  await adminDb.collection("services").doc(id).delete();
  await logActivity("delete", "services", id, label);
  revalidatePath("/");
}
