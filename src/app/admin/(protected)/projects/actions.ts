"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import type { Project } from "@/lib/types";

type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export async function createProject(data: ProjectInput) {
  await verifyAdminSession();
  await adminDb.collection("projects").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function updateProject(id: string, slug: string, data: Partial<ProjectInput>) {
  await verifyAdminSession();
  await adminDb
    .collection("projects")
    .doc(id)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
}

export async function deleteProject(id: string) {
  await verifyAdminSession();
  await adminDb.collection("projects").doc(id).delete();
  revalidatePath("/");
  revalidatePath("/projects");
}
