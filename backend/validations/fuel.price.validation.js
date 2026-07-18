import { z } from "zod";

export const createPriceSchema = z.object({
    fuelType: z
        .string({ error: "Fuel type is required" })
        .trim()
        .transform((value) => value.toUpperCase())
        .pipe(
            z.enum(["PETROL", "DIESEL", "PREMIUM"], {
                error: "Fuel type must be either PETROL, DIESEL or PREMIUM",
            })
        ),

    price: z.coerce
        .number({
            error: "Price is required and must be a numeric value",
        })
        .positive("Price must be greater than 0"),

    effectiveFrom: z.coerce
        .date()
        .optional(),
});
