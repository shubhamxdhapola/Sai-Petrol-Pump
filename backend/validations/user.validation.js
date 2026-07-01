import { z } from "zod";

export const createUserSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(30, "Name cannot exceed 30 characters"),

    phone: z
        .string({ error: "Phone number is required" })
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),

    password: z
        .string({ error: "Password is required" })
        .min(4, "Password must be at least 4 characters")
        .max(20, "Password cannot exceed 20 characters")
});

export const updateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(30, "Name cannot exceed 50 characters")
        .optional(),

    phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number")
        .optional(),

    isActive: z
        .boolean({error : "Enter a boolean value"})
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update",
    }
);