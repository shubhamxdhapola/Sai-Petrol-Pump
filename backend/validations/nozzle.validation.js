import { z } from "zod";

export const createNozzleSchema = z.object({
    nozzleNumber: z
        .string({ error: "Nozzle number is required" })
        .trim()
        .min(1, "Nozzle number must be at least 1 character")
        .max(20, "Nozzle number cannot exceed 20 characters"),

    tankId: z
        .string({ error: "Tank is required" }),

    currentReading: z.coerce
        .number({ error: "Current reading is required" })
        .min(0, "Current reading cannot be negative"),
});

export const updateNozzleSchema = z
    .object({
        nozzleNumber: z
            .string({ error: "Nozzle number is requird" })
            .trim()
            .min(1, "Nozzle number must be at least 1 character")
            .max(20, "Nozzle number cannot exceed 20 characters")
            .optional(),

        tankId: z
            .string({ error: "Tank id is required" })
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