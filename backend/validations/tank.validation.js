import { z } from "zod";

export const createTankSchema = z
    .object({
        name: z
            .string({ error: "Tank name is required" })
            .trim()
            .min(1, "Tank name must be at least 1 character")
            .max(20, "Tank name cannot exceed 20 characters"),

        tankNumber: z
            .string({ error: "Tank number is required" })
            .trim()
            .min(1, "Tank number must be at least 1 character")
            .max(20, "Tank number cannot exceed 20 characters"),

        fuelType: z.string({ error: "Fuel type is required" })
            .trim()
            .transform((value) => value.toUpperCase())
            .pipe(
                z.enum(["PETROL", "DIESEL"], {
                    error: "Fuel type must be either PETROL or DIESEL",
                })
            ),

        capacity: z
            .coerce
            .number({ error: "Capacity must be a numeric value" })
            .min(1, "Capacity must be greater than 0"),

        currentQuantity: z
            .coerce
            .number({ error: "Current quantity must be a numeric value" })
            .min(0, "Current quantity cannot be negative"),
    })
    .refine(
        (data) => data.currentQuantity <= data.capacity,
        {
            message: "Current quantity cannot exceed tank capacity",
            path: ["currentQuantity"],
        }
    );

export const updateTankSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Tank name must be at least 1 character")
            .max(20, "Tank name cannot exceed 20 characters")
            .optional(),

        tankNumber: z
            .string()
            .trim()
            .min(1, "Tank number must be at least 1 character")
            .max(20, "Tank number cannot exceed 20 characters")
            .optional(),

        capacity: z
            .coerce
            .number()
            .min(1, "Capacity must be greater than 0")
            .optional(),

        isActive: z
            .boolean({error : "Must be a boolean value"})
            .optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required to update",
        }
    );