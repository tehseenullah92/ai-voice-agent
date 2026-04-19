/** Open-redirect safe internal path for post-login navigation. */
export function getSafeRedirectPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}
