"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import type { Testimonial } from "@/lib/types";

type TestimonialInput = Omit<Testimonial, "id" | "createdAt">;

export async function createTestimonial(data: TestimonialInput) {
  await verifyAdminSession();
  await adminDb.collection("testimonials").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  revalidatePath("/");
}

export async function updateTestimonial(
  id: string,
  data: Partial<TestimonialInput>,
) {
  await verifyAdminSession();
  await adminDb.collection("testimonials").doc(id).update(data);
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  await verifyAdminSession();
  await adminDb.collection("testimonials").doc(id).delete();
  revalidatePath("/");
}
