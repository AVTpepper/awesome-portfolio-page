import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col p-6",
        service.popular && "ring-2 ring-accent"
      )}
    >
      {service.popular && (
        <span className="mb-4 inline-flex w-fit rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>

      {service.features.length > 0 && (
        <ul className="mt-6 flex-1 space-y-2">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-0.5 text-accent" aria-hidden="true">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-2xl font-bold text-foreground">{service.price}</p>
      </div>
    </Card>
  );
}
