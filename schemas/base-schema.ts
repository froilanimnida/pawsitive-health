import { z } from "zod";

export const BaseIdentifierSchema = z.object({
    user_id: z.string(),
});

export type BaseIdentifierType = z.infer<typeof BaseIdentifierSchema>;
