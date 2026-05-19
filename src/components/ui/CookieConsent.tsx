"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface CookieConsentProps {
  gaId: string;
}

type ConsentState = "granted" | "denied" | null;

export default function CookieConsent({ gaId }: CookieConsentProps) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ga_consent") as ConsentState | null;
    setConsent(stored);
    setLoaded(true);
  }, []);

  function accept() {
    localStorage.setItem("ga_consent", "granted");
    setConsent("granted");
  }

  function decline() {
    localStorage.setItem("ga_consent", "denied");
    setConsent("denied");
  }

  // Inject GA4 when consent is granted
  const injectGA = loaded && consent === "granted";

  return (
    <>
      {injectGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {loaded && consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card px-4 py-4 shadow-lg sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              This site uses cookies to analyse traffic and improve your experience.
              No data is collected until you accept.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={decline}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
