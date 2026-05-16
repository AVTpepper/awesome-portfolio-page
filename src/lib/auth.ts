import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/server";

export async function verifyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/admin/login");
  try {
    await adminAuth.verifySessionCookie(session, true);
  } catch {
    redirect("/admin/login");
  }
}
