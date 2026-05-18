import "server-only";
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

export async function getProjects(): Promise<Project[]> {
  const snap = await adminDb
    .collection("projects")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(projectFromDoc);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const snap = await adminDb
    .collection("projects")
    .where("featured", "==", true)
    .get();
  return snap.docs.map(projectFromDoc).sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | null> {
  const snap = await adminDb
    .collection("projects")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return projectFromDoc(snap.docs[0]);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const doc = await adminDb.collection("projects").doc(id).get();
  if (!doc.exists) return null;
  return projectFromDoc(doc);
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function testimonialFromDoc(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
): Testimonial {
  const data = doc.data() as Omit<Testimonial, "id">;
  return { id: doc.id, ...data };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const snap = await adminDb
    .collection("testimonials")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(testimonialFromDoc);
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const snap = await adminDb
    .collection("testimonials")
    .where("featured", "==", true)
    .get();
  return snap.docs.map(testimonialFromDoc).sort((a, b) => a.order - b.order);
}

export async function getTestimonialById(
  id: string,
): Promise<Testimonial | null> {
  const doc = await adminDb.collection("testimonials").doc(id).get();
  if (!doc.exists) return null;
  return testimonialFromDoc(doc);
}

// ─── Services ─────────────────────────────────────────────────────────────────

function serviceFromDoc(
  doc: DocumentSnapshot | QueryDocumentSnapshot,
): Service {
  const data = doc.data() as Omit<Service, "id">;
  return { id: doc.id, ...data };
}

export async function getServices(): Promise<Service[]> {
  const snap = await adminDb
    .collection("services")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(serviceFromDoc);
}

export async function getServiceById(id: string): Promise<Service | null> {
  const doc = await adminDb.collection("services").doc(id).get();
  if (!doc.exists) return null;
  return serviceFromDoc(doc);
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const doc = await adminDb.collection("settings").doc("site").get();
  if (!doc.exists) return null;
  return doc.data() as SiteSettings;
}
