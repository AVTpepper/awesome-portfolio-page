import React from "react";

// Lightweight test double for next/link.
// Renders a plain <a> so tests can assert on href and accessible name
// without needing the Next.js router context.
export default function MockLink({
  href,
  children,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  ...props
}: {
  href: string;
  children?: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  [key: string]: unknown;
}) {
  return (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  );
}
