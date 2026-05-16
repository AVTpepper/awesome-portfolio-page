/**
 * Returns true only for relative paths — paths starting with `/` but not `//`.
 * Use this to validate the `from` query parameter before redirecting after login,
 * preventing open-redirect attacks.
 *
 * @example
 * const from = searchParams.get("from") ?? "/admin/dashboard";
 * const redirectTo = isSafeRedirectPath(from) ? from : "/admin/dashboard";
 */
export function isSafeRedirectPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

/** Joins class names, filtering out falsy values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
