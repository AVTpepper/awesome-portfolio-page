"use client";

import { useInView } from "@/hooks/useInView";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: string; // e.g. 'delay-150'
}

export default function RevealOnScroll({
  children,
  className = "",
  delay = "",
}: RevealOnScrollProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`motion-safe:transition-all motion-safe:duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${delay} ${className}`}
    >
      {children}
    </div>
  );
}
