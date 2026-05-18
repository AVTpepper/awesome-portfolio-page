import SectionHeading from "@/components/ui/SectionHeading";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import TestimonialCard from "./TestimonialCard";
import type { Testimonial } from "@/lib/types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionHeading
            title="What People Say"
            subtitle="Kind words from clients and collaborators."
            centered
          />
        </RevealOnScroll>

        {testimonials.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <RevealOnScroll
                key={testimonial.id}
                delay={i === 1 ? "delay-150" : i === 2 ? "delay-300" : ""}
              >
                <TestimonialCard testimonial={testimonial} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-muted-foreground">
            Testimonials coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
