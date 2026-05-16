"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import type { Service } from "@/lib/types";

type ServiceInput = Omit<Service, "id" | "updatedAt">;

export async function createService(data: ServiceInput) {
  await verifyAdminSession();
  await adminDb.collection("services").add({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath("/");
}

export async function updateService(id: string, data: Partial<ServiceInput>) {
  await verifyAdminSession();
  await adminDb
    .collection("services")
    .doc(id)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/");
}

export async function deleteService(id: string) {
  await verifyAdminSession();
  await adminDb.collection("services").doc(id).delete();
  revalidatePath("/");
}
