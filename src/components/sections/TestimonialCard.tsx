import Image from "next/image";
import Card from "@/components/ui/Card";
import type { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="flex flex-col p-6">
      <blockquote className="flex-1">
        <p className="text-base leading-7 text-foreground">
          &ldquo;{testimonial.content}&rdquo;
        </p>
      </blockquote>

      <div className="mt-6 flex items-center gap-3">
        {testimonial.avatarUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={testimonial.avatarUrl}
              alt={testimonial.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {testimonial.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">
            {testimonial.role}
            {testimonial.company && `, ${testimonial.company}`}
          </p>
        </div>
      </div>
    </Card>
  );
}
