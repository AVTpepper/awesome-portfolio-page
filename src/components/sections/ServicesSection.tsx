import SectionHeading from "@/components/ui/SectionHeading";
import ServiceCard from "./ServiceCard";
import type { Service } from "@/lib/types";

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section id="services" className="py-24 bg-muted">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Services"
          subtitle="How I can help you."
          centered
        />

        {services.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
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
