import { z } from "zod";

export const loginSchema = z.object({
    phone: z
        .string({error : "Phone number is required"})
        .trim()
        .min(1, "Phone number is required"),

    password: z
        .string({error : "Password is required"})
        .min(1, "Password is required")
})

export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(4, "New password must be at least 4 characters")
        .max(20, "New password cannot exceed 20 characters")
});