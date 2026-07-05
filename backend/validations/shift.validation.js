import { z } from "zod";

export const startShiftSchema = z.object({
    machineId: z.string(),

    nozzleIds: z
        .array(z.string())
        .min(1, "Select at least one nozzle"),
});

export const endShiftSchema = z.object({
    readings: z
        .array(
            z.object({
                nozzleId: z.string(),

                closingReading: z.coerce
                    .number()
                    .min(0),
            })
        )
        .min(1),
});