import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm h-64 animate-pulse" />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}


