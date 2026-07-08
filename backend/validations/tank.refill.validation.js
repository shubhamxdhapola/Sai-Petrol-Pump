import { z } from 'zod'

export const createTankRefillSchema = z.object({
    quantity: z.coerce
        .number({ error: "Quantity is required and must be a numeric value" })
        .min(1, "Quantity must be greater than 0"),

    pricePerLitre: z.coerce
        .number({ error: "Price is required and must be a numeric value" })
        .min(1, "Price must be greater than 1"),

    refillDate: z.coerce
        .date()
        .optional(),

    remarks: z.string({ error: "Remarks are required" })
        .trim()
        .max(200)
        .optional(),
});

export const updateTankRefillSchema = z.object({
    quantity: z.coerce
        .number({ error: "Quantity must be a numeric value" })
        .min(1, "Quantity must be greater than 0")
        .optional(),

    pricePerLitre: z.coerce
        .number({ error: "Price is required and must be a numeric value" })
        .min(1, "Price must be greater than 1")
        .optional(),

    refillDate: z.coerce
        .date()
        .optional(),

    remarks: z.string({ error: "Remarks are required" })
        .trim()
        .max(200)
        .optional(),
}).refine(
    data => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update",
    }
);