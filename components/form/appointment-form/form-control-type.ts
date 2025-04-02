import { type z } from "zod";
import { type AppointmentSchema } from "@/schemas/appointment-definition";
export type AppointmentControlSchema = z.infer<typeof AppointmentSchema>;
