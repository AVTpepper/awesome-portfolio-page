import SectionHeading from "@/components/ui/SectionHeading";
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
        <SectionHeading
          title="What People Say"
          subtitle="Kind words from clients and collaborators."
          centered
        />

        {testimonials.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
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
