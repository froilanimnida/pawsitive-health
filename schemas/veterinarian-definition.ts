import { z } from "zod";
import { SignUpSchema } from "./auth-definitions";
import { veterinary_specialization } from "@prisma/client";

export const VeterinarianSchema = z.object({
    ...SignUpSchema.innerType().shape,
    license_number: z.string().nonempty({ message: "License number is required." }),
    specialization: z
        .enum(Object.values(veterinary_specialization) as [string, ...string[]], {
            message: "Invalid specialization type",
            required_error: "Specialization is required",
            invalid_type_error: "Invalid specialization type",
        })
        .refine(
            (value) => {
                return Object.values(veterinary_specialization).includes(value as veterinary_specialization);
            },
            {
                message: "Invalid specialization type",
            },
        ),
});

export type VeterinarianType = z.infer<typeof VeterinarianSchema>;
