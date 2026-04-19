export function emailInitials(email: string): string {
  const local = email.split("@")[0] ?? "?";
  const parts = local.split(/[.\-_+]/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return `${a}${b}`.toUpperCase() || "?";
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

export function emailDisplayName(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local;
}
