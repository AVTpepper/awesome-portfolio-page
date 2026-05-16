import Image from "next/image";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import type { SiteSettings } from "@/lib/types";

interface AboutSectionProps {
  settings: SiteSettings | null;
}

export default function AboutSection({ settings }: AboutSectionProps) {
  const about = settings?.about;
  const bio = about?.bio ?? "";
  const skills = about?.skills ?? [];
  const profileImageUrl = about?.profileImageUrl ?? null;

  return (
    <section id="about" className="py-24 bg-muted">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text content */}
          <div>
            <SectionHeading title="About Me" />
            {bio ? (
              <p className="mt-6 text-base leading-7 text-muted-foreground whitespace-pre-line">
                {bio}
              </p>
            ) : (
              <p className="mt-6 text-base leading-7 text-muted-foreground">
                Bio coming soon.
              </p>
            )}
            {skills.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} label={skill} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile image */}
          <div className="flex justify-center lg:justify-end">
            {profileImageUrl ? (
              <div className="relative h-72 w-72 overflow-hidden rounded-full border-4 border-border shadow-lg sm:h-80 sm:w-80">
                <Image
                  src={profileImageUrl}
                  alt="Profile photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 288px, 320px"
                />
              </div>
            ) : (
              <div className="flex h-72 w-72 items-center justify-center rounded-full border-4 border-border bg-card text-muted-foreground sm:h-80 sm:w-80">
                <span className="text-sm">No image yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
