import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

export const signupBodySchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .max(255)
    .email("Enter a valid email address.")
    .transform((s) => s.trim().toLowerCase()),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .max(255)
    .email("Enter a valid email address.")
    .transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

export type SignupBody = z.infer<typeof signupBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: passwordSchema,
});

export const deleteAccountBodySchema = z.object({
  password: z.string().min(1, "Enter your password to confirm."),
});
