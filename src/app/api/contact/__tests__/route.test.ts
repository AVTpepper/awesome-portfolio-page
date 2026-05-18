import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockSendEmail, mockFirestoreAdd, mockFirestoreCollection, mockServerTimestamp } =
  vi.hoisted(() => ({
    mockSendEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
    mockFirestoreAdd: vi.fn().mockResolvedValue({ id: "doc-id" }),
    mockFirestoreCollection: vi.fn(),
    mockServerTimestamp: vi.fn().mockReturnValue("__ts__"),
  }));

vi.mock("resend", () => ({
  // Arrow functions can't be called with `new`; use a regular function
  Resend: vi.fn(function (this: unknown) {
    return { emails: { send: mockSendEmail } };
  }),
}));

vi.mock("@/lib/firebase/server", () => ({
  adminDb: { collection: mockFirestoreCollection },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: mockServerTimestamp },
}));

import { POST } from "../route";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Each test uses a unique IP to avoid hitting the rate limiter
let ipSeq = 0;

function makeRequest(
  body: unknown,
  { ip, badJson = false }: { ip?: string; badJson?: boolean } = {},
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-forwarded-for": ip ?? `172.16.${Math.floor(ipSeq / 254)}.${(ipSeq++ % 254) + 1}`,
  };
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers,
    body: badJson ? "not-valid-json{{" : JSON.stringify(body),
  }) as unknown as NextRequest;
}

const VALID_BODY = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "I need a website.",
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockSendEmail.mockResolvedValue({ id: "email-123" });
  mockFirestoreAdd.mockResolvedValue({ id: "doc-id" });
  mockFirestoreCollection.mockReturnValue({ add: mockFirestoreAdd });
  vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "owner@example.com");
});

// ── Honeypot ──────────────────────────────────────────────────────────────────

describe("honeypot", () => {
  it("returns 200 without calling Resend when the website field is populated", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, website: "http://spam.com" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

// ── Input validation ──────────────────────────────────────────────────────────

describe("input validation", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await POST(makeRequest(null, { badJson: true }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a null body", async () => {
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
  });

  it("returns 422 when name is missing", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, name: "" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/name/i);
  });

  it("returns 422 when email is missing", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: "" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/email/i);
  });

  it("returns 422 for an email address without an @", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: "not-an-email" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for an email address without a TLD", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: "user@nodot" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 when message is missing", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, message: "" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/message/i);
  });

  it("subject is optional — succeeds without it", async () => {
    const { subject: _omit, ...noSubject } = VALID_BODY;
    const res = await POST(makeRequest(noSubject));
    expect(res.status).toBe(200);
  });

  it("truncates name to 100 characters", async () => {
    const longName = "A".repeat(150);
    await POST(makeRequest({ ...VALID_BODY, name: longName }));
    const sentCall = mockSendEmail.mock.calls[0][0];
    // The truncated name should appear in the email text
    expect(sentCall.text).toContain("A".repeat(100));
    expect(sentCall.text).not.toContain("A".repeat(101));
  });

  it("truncates message to 2000 characters", async () => {
    const longMsg = "B".repeat(2500);
    await POST(makeRequest({ ...VALID_BODY, message: longMsg }));
    const sentCall = mockSendEmail.mock.calls[0][0];
    expect(sentCall.text).toContain("B".repeat(2000));
    expect(sentCall.text).not.toContain("B".repeat(2001));
  });
});

// ── Rate limiting ─────────────────────────────────────────────────────────────

describe("rate limiting", () => {
  // Use a fixed IP across 4 requests to trigger the 3-per-window limit
  const RATE_IP = "10.99.99.99";

  it("returns 429 after exceeding 3 requests from the same IP within the window", async () => {
    for (let i = 0; i < 3; i++) {
      await POST(makeRequest(VALID_BODY, { ip: RATE_IP }));
    }
    const res = await POST(makeRequest(VALID_BODY, { ip: RATE_IP }));
    expect(res.status).toBe(429);
    expect((await res.json()).ok).toBe(false);
  });

  it("allows requests under the limit through", async () => {
    const ip = "10.88.88.88";
    const res = await POST(makeRequest(VALID_BODY, { ip }));
    expect(res.status).toBe(200);
  });
});

// ── Server configuration ──────────────────────────────────────────────────────

describe("server configuration", () => {
  it("returns 500 when CONTACT_RECIPIENT_EMAIL is not set", async () => {
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "");
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/configuration/i);
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe("successful submission", () => {
  it("returns 200 with { ok: true }", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("calls Resend with the recipient from CONTACT_RECIPIENT_EMAIL", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@example.com" }),
    );
  });

  it("sets replyTo to the sender's email address", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: "jane@example.com" }),
    );
  });

  it("includes the sender name and message in the email body", async () => {
    await POST(makeRequest(VALID_BODY));
    const { text } = mockSendEmail.mock.calls[0][0];
    expect(text).toContain("Jane Doe");
    expect(text).toContain("I need a website.");
  });

  it("includes the subject in the email subject line", async () => {
    await POST(makeRequest(VALID_BODY));
    const { subject } = mockSendEmail.mock.calls[0][0];
    expect(subject).toContain("Hello");
  });

  it("uses a fallback subject when none is provided", async () => {
    const { subject: _omit, ...noSubject } = VALID_BODY;
    await POST(makeRequest(noSubject));
    const { subject } = mockSendEmail.mock.calls[0][0];
    expect(subject).toContain("no subject");
  });

  it("persists the submission to the contact-submissions Firestore collection", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockFirestoreCollection).toHaveBeenCalledWith("contact-submissions");
    expect(mockFirestoreAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        email: "jane@example.com",
        message: "I need a website.",
      }),
    );
  });

  it("includes a server timestamp in the Firestore document", async () => {
    await POST(makeRequest(VALID_BODY));
    expect(mockFirestoreAdd).toHaveBeenCalledWith(
      expect.objectContaining({ createdAt: "__ts__" }),
    );
  });
});

// ── Error paths ───────────────────────────────────────────────────────────────

describe("error handling", () => {
  it("returns 502 when Resend throws", async () => {
    mockSendEmail.mockRejectedValueOnce(new Error("Resend API error"));
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
  });

  it("still returns 200 when Firestore persistence fails (non-fatal)", async () => {
    mockFirestoreAdd.mockRejectedValueOnce(new Error("Firestore unavailable"));
    const res = await POST(makeRequest(VALID_BODY));
    // Email was sent; Firestore failure must not fail the overall request
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});
