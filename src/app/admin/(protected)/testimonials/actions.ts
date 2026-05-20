"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import { logActivity } from "@/lib/firebase/activity";
import type { Testimonial } from "@/lib/types";

type TestimonialInput = Omit<Testimonial, "id" | "createdAt">;

export async function createTestimonial(data: TestimonialInput) {
  await verifyAdminSession();
  const ref = await adminDb.collection("testimonials").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  void logActivity("create", "testimonials", ref.id, data.name);
  revalidatePath("/");
}

export async function updateTestimonial(
  id: string,
  data: Partial<TestimonialInput>,
) {
  await verifyAdminSession();
  await adminDb.collection("testimonials").doc(id).update(data);
  void logActivity("update", "testimonials", id, data.name ?? "(updated)");
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  await verifyAdminSession();
  const doc = await adminDb.collection("testimonials").doc(id).get();
  const label = (doc.data() as Pick<Testimonial, "name"> | undefined)?.name ?? "(deleted)";
  await adminDb.collection("testimonials").doc(id).delete();
  void logActivity("delete", "testimonials", id, label);
  revalidatePath("/");
}
