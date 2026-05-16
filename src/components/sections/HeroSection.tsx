import Button from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/types";

interface HeroSectionProps {
  settings: SiteSettings | null;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const headline = settings?.hero.headline ?? "Hi, I'm a Full-Stack Developer";
  const subheadline =
    settings?.hero.subheadline ??
    "I build fast, accessible web applications with modern technologies.";
  const primaryLabel = settings?.hero.ctaPrimaryLabel ?? "View My Work";
  const secondaryLabel = settings?.hero.ctaSecondaryLabel ?? "Hire Me";

  return (
    <section
      id="hero"
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          {headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          {subheadline}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button href="/#projects" size="lg">
            {primaryLabel}
          </Button>
          <Button href="/#contact" variant="secondary" size="lg">
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
