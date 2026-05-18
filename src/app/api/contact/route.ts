import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Rate limiting ────────────────────────────────────────────────────────────
// Simple in-memory store. Sufficient for single-instance portfolio deployment.
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface RateEntry {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count += 1;
  return false;
}

// ── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Resolve client IP from Vercel/Firebase App Hosting forwarded header
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // ── Honeypot ───────────────────────────────────────────────────────────────
  if (raw.website) {
    // Bot filled the hidden field — silently accept but do nothing
    return NextResponse.json({ ok: true });
  }

  // ── Field extraction & sanitization ───────────────────────────────────────
  const name = sanitize(raw.name, 100);
  const email = sanitize(raw.email, 254);
  const subject = sanitize(raw.subject, 200);
  const message = sanitize(raw.message, 2000);

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 422 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 422 });
  }
  if (!message) {
    return NextResponse.json({ ok: false, error: "Message is required." }, { status: 422 });
  }

  // ── Send email ─────────────────────────────────────────────────────────────
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL;
  if (!recipient) {
    return NextResponse.json({ ok: false, error: "Server configuration error." }, { status: 500 });
  }

  try {
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: recipient,
      replyTo: email,
      subject: `New contact: ${subject || "(no subject)"}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to send message. Please try again." },
      { status: 502 }
    );
  }

  // ── Persist to Firestore ───────────────────────────────────────────────────
  try {
    await adminDb.collection("contact-submissions").add({
      name,
      email,
      subject,
      message,
      ip,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Non-fatal — email already sent; log but don't fail the request
    console.error("Failed to persist contact submission to Firestore");
  }

  return NextResponse.json({ ok: true });
}
