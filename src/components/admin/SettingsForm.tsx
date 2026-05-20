"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@/lib/types";
import ImageUpload from "@/components/admin/ImageUpload";
import ProfileImageUpload from "@/components/admin/ProfileImageUpload";

interface SettingsFormProps {
  initial: SiteSettings;
  onSubmit: (data: Partial<SiteSettings>) => Promise<void>;
}

export default function SettingsForm({ initial, onSubmit }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hero
  const [headline, setHeadline] = useState(initial.hero?.headline ?? "");
  const [subheadline, setSubheadline] = useState(initial.hero?.subheadline ?? "");
  const [ctaPrimary, setCtaPrimary] = useState(initial.hero?.ctaPrimaryLabel ?? "");
  const [ctaSecondary, setCtaSecondary] = useState(initial.hero?.ctaSecondaryLabel ?? "");

  // About
  const [bio, setBio] = useState(initial.about?.bio ?? "");
  const [skills, setSkills] = useState((initial.about?.skills ?? []).join(", "));
  const [profileImageUrl, setProfileImageUrl] = useState(initial.about?.profileImageUrl ?? "");

  // Contact
  const [email, setEmail] = useState(initial.contact?.email ?? "");
  const [github, setGithub] = useState(initial.contact?.socials?.github ?? "");
  const [linkedin, setLinkedin] = useState(initial.contact?.socials?.linkedin ?? "");
  const [twitter, setTwitter] = useState(initial.contact?.socials?.twitter ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const data: Partial<SiteSettings> = {
      hero: {
        headline: headline.trim(),
        subheadline: subheadline.trim(),
        ctaPrimaryLabel: ctaPrimary.trim(),
        ctaSecondaryLabel: ctaSecondary.trim(),
      },
      about: {
        bio: bio.trim(),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        profileImageUrl: profileImageUrl.trim(),
      },
      contact: {
        email: email.trim(),
        socials: {
          github: github.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          twitter: twitter.trim() || undefined,
        },
      },
    };

    startTransition(async () => {
      try {
        await onSubmit(data);
        setSuccess(true);
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
      {/* Hero */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Hero</h2>
        <div className="space-y-4">
          <Field label="Headline">
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} placeholder="Hi, I'm Jane" />
          </Field>
          <Field label="Subheadline">
            <input type="text" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className={inputClass} placeholder="Full-stack developer…" />
          </Field>
          <Field label="Primary CTA Label">
            <input type="text" value={ctaPrimary} onChange={(e) => setCtaPrimary(e.target.value)} className={inputClass} placeholder="View my work" />
          </Field>
          <Field label="Secondary CTA Label">
            <input type="text" value={ctaSecondary} onChange={(e) => setCtaSecondary(e.target.value)} className={inputClass} placeholder="Get in touch" />
          </Field>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">About</h2>
        <div className="space-y-4">
          <Field label="Bio">
            <textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass + " resize-y"} />
          </Field>
          <Field label="Skills" hint="Comma-separated">
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className={inputClass} placeholder="React, TypeScript, Node.js" />
          </Field>
          <Field label="Profile Image">
            <ProfileImageUpload
              currentUrl={profileImageUrl || undefined}
              onUpload={setProfileImageUrl}
            />
            <input type="text" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} className={inputClass + " mt-2"} placeholder="Or paste URL" />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Contact</h2>
        <div className="space-y-4">
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="hello@example.com" />
          </Field>
          <Field label="GitHub URL">
            <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className={inputClass} placeholder="https://github.com/..." />
          </Field>
          <Field label="LinkedIn URL">
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/..." />
          </Field>
          <Field label="Twitter/X URL">
            <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} className={inputClass} placeholder="https://twitter.com/..." />
          </Field>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Settings saved.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent";
