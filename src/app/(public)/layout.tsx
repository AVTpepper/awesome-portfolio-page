import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getIsAdmin } from "@/lib/auth";
import type { ReactNode } from "react";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const isAdmin = await getIsAdmin();

  return (
    <>
      <Header isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
