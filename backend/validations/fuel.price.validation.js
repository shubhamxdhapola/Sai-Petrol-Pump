import { z } from "zod";

export const createPriceSchema = z.object({
    fuelType: z
        .string({ error: "Fuel type is required" })
        .trim()
        .transform((value) => value.toUpperCase())
        .pipe(
            z.enum(["PETROL", "DIESEL"], {
                error: "Fuel type must be either PETROL or DIESEL",
            })
        ),

    price: z.coerce
        .number({
            error: "Price is required and must be a numeric value",
        })
        .positive("Price must be greater than 0"),
});