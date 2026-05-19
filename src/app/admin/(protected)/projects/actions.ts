"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/server";
import { logActivity } from "@/lib/firebase/activity";
import type { Project } from "@/lib/types";

type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export async function createProject(data: ProjectInput) {
  await verifyAdminSession();
  const ref = await adminDb.collection("projects").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logActivity("create", "projects", ref.id, data.title);
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function updateProject(id: string, slug: string, data: Partial<ProjectInput>) {
  await verifyAdminSession();
  await adminDb
    .collection("projects")
    .doc(id)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  await logActivity("update", "projects", id, data.title ?? "(updated)");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
}

export async function deleteProject(id: string) {
  await verifyAdminSession();
  const doc = await adminDb.collection("projects").doc(id).get();
  const label = (doc.data() as Pick<Project, "title"> | undefined)?.title ?? "(deleted)";
  await adminDb.collection("projects").doc(id).delete();
  await logActivity("delete", "projects", id, label);
  revalidatePath("/");
  revalidatePath("/projects");
}
