import BaseFormField from "@/types/forms/base-fields";

export interface TextFormField extends BaseFormField {
    name: string;
    type?: "text" | "email" | "password" | "number" | "tel";
    autoComplete?: string;
    minLength?: number;
    maxLength?: number;
}
