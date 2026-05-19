"use client";

import Button from "@/components/ui/Button";

interface HeroCtasProps {
  primaryLabel: string;
  secondaryLabel: string;
}

export default function HeroCtas({ primaryLabel, secondaryLabel }: HeroCtasProps) {
  function handleCtaClick(label: string) {
    window.gtag?.("event", "cta_click", {
      event_category: "engagement",
      cta_label: label,
    });
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Button href="/#projects" size="lg" onClick={() => handleCtaClick("view_work")}>
        {primaryLabel}
      </Button>
      <Button
        href="/#contact"
        variant="secondary"
        size="lg"
        onClick={() => handleCtaClick("hire_me")}
      >
        {secondaryLabel}
      </Button>
    </div>
  );
}
