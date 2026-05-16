"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialState: FormState = { name: "", email: "", subject: "", message: "" };

// Phase 5: form submission will be wired to a real backend (Firebase callable
// function or email API). Until then the submit button is intentionally disabled
// so visitors are never given a false "message sent" confirmation.
export default function ContactSection() {
  const [form, setForm] = useState<FormState>(initialState);

  return (
    <section id="contact" className="py-24 bg-muted">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Get In Touch"
          subtitle="Have a project in mind? I'd love to hear from you."
          centered
        />

        <form
          onSubmit={(e) => e.preventDefault()}
          noValidate
          className="mt-12 space-y-6"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="contact-name"
              className="block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="contact-email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
            />
          </div>

          {/* Subject (optional) */}
          <div>
            <label
              htmlFor="contact-subject"
              className="block text-sm font-medium text-foreground"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="What's this about? (optional)"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-foreground"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Tell me about your project..."
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled
              className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-accent/50 px-6 py-3 text-base font-medium text-accent-foreground cursor-not-allowed"
            >
              Send Message
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Contact form coming soon — backend wiring in progress.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

