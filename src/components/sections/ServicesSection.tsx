import SectionHeading from "@/components/ui/SectionHeading";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ServiceCard from "./ServiceCard";
import type { Service } from "@/lib/types";

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section id="services" className="py-24 bg-muted">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionHeading
            title="Services"
            subtitle="How I can help you."
            centered
          />
        </RevealOnScroll>

        {services.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <RevealOnScroll
                key={service.id}
                delay={i === 1 ? "delay-150" : i === 2 ? "delay-300" : ""}
              >
                <ServiceCard service={service} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-muted-foreground">
            Services coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
