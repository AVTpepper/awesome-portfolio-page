import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export default function Card({
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground",
        hoverable &&
          "transition-shadow duration-200 hover:shadow-md hover:shadow-border/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
