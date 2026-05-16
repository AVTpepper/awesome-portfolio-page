import React from "react";

// Lightweight test double for next/image.
// Renders a plain <img> so tests can assert on src and alt
// without needing Next.js image optimisation infrastructure.
export default function MockImage({
  src,
  alt,
  fill: _fill,
  sizes: _sizes,
  priority: _priority,
  ...props
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  [key: string]: unknown;
}) {
  return (
    <img src={src} alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  );
}
