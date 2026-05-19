import "server-only";
import { cache } from "react";
import type { Project, Testimonial, Service, SiteSettings } from "@/lib/types";
import type {
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { adminDb } from "./server";

// ─── Projects ────────────────────────────────────────────────────────────────

function projectFromDoc(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
): Project {
  const data = doc.data() as Omit<Project, "id">;
  return { id: doc.id, ...data };
}

export const getProjects = cache(async (): Promise<Project[]> => {
  const snap = await adminDb
    .collection("projects")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(projectFromDoc);
});

export const getFeaturedProjects = cache(async (): Promise<Project[]> => {
  const snap = await adminDb
    .collection("projects")
    .where("featured", "==", true)
    .get();
  return snap.docs.map(projectFromDoc).sort((a, b) => a.order - b.order);
});

export const getProjectBySlug = cache(async (
  slug: string,
): Promise<Project | null> => {
  const snap = await adminDb
    .collection("projects")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return projectFromDoc(snap.docs[0]);
});

export const getProjectById = cache(async (id: string): Promise<Project | null> => {
  const doc = await adminDb.collection("projects").doc(id).get();
  if (!doc.exists) return null;
  return projectFromDoc(doc);
});

// ─── Testimonials ─────────────────────────────────────────────────────────────

function testimonialFromDoc(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
): Testimonial {
  const data = doc.data() as Omit<Testimonial, "id">;
  return { id: doc.id, ...data };
}

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const snap = await adminDb
    .collection("testimonials")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(testimonialFromDoc);
});

export const getFeaturedTestimonials = cache(async (): Promise<Testimonial[]> => {
  const snap = await adminDb
    .collection("testimonials")
    .where("featured", "==", true)
    .get();
  return snap.docs.map(testimonialFromDoc).sort((a, b) => a.order - b.order);
});

export const getTestimonialById = cache(async (
  id: string,
): Promise<Testimonial | null> => {
  const doc = await adminDb.collection("testimonials").doc(id).get();
  if (!doc.exists) return null;
  return testimonialFromDoc(doc);
});

// ─── Services ─────────────────────────────────────────────────────────────────

function serviceFromDoc(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
): Service {
  const data = doc.data() as Omit<Service, "id">;
  return { id: doc.id, ...data };
}

export const getServices = cache(async (): Promise<Service[]> => {
  const snap = await adminDb
    .collection("services")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(serviceFromDoc);
});

export const getServiceById = cache(async (id: string): Promise<Service | null> => {
  const doc = await adminDb.collection("services").doc(id).get();
  if (!doc.exists) return null;
  return serviceFromDoc(doc);
});

// ─── Site Settings ────────────────────────────────────────────────────────────

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const doc = await adminDb.collection("settings").doc("site").get();
  if (!doc.exists) return null;
  return doc.data() as SiteSettings;
});

// ─── Admin Activity ───────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  action: "create" | "update" | "delete";
  collection: string;
  docId: string;
  label: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
}

export async function getRecentActivity(limit = 10): Promise<ActivityEntry[]> {
  const snap = await adminDb
    .collection("admin-activity")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ActivityEntry, "id">),
  }));
}
