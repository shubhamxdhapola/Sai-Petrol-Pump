import { z } from "zod";

export const createMachineSchema = z.object({
    name: z
        .string({ error: "Machine name is required" })
        .trim()
        .min(1, "Machine name must be at least 1 character")
        .max(20, "Machine name cannot exceed 20 characters"),

    machineNumber: z
        .string({ error: "Machine number is required" })
        .trim()
        .min(1, "Machine number must be at least 1 character")
        .max(20, "Machine number cannot exceed 20 characters"),
});

export const updateMachineSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Machine name must be at least 1 character")
            .max(20, "Machine name cannot exceed 20 characters")
            .optional(),

        machineNumber: z
            .string()
            .trim()
            .min(1, "Machine number must be at least 1 character")
            .max(20, "Machine number cannot exceed 20 characters")
            .optional(),

        isActive: z
            .boolean({ error: "Must be a boolean value" })
            .optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required to update",
        }
    );