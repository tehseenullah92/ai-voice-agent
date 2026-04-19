export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

const LABELS: Record<number, string> = {
  1: "Use at least 8 characters.",
  2: "Fair — add mixed case, numbers, or symbols.",
  3: "Good — solid for most accounts.",
  4: "Strong — great choice.",
};

/** Inline signup feedback: 0 = empty, 1 = too short / weak, up to 4 = strong. */
export function measurePasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "" };
  if (password.length < 8) {
    return { score: 1, label: LABELS[1] };
  }

  let s = 2;
  if (password.length >= 12) s += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s += 1;
  if (/\d/.test(password)) s += 1;
  if (/[^A-Za-z0-9]/.test(password)) s += 1;

  const score = Math.min(4, s) as 2 | 3 | 4;
  return { score, label: LABELS[score] ?? LABELS[2] };
}
