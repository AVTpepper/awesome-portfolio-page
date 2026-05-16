import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";

const SESSION_EXPIRY_MS = 60 * 60 * 24 * 14 * 1000; // 14 days

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).idToken !== "string"
  ) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  const { idToken } = body as { idToken: string };

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_EXPIRY_MS / 1000,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
