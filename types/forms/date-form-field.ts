import BaseFormField from "@/types/forms/base-fields";

export interface DateFormField extends BaseFormField {
    name: string;
    minDate?: Date;
    maxDate?: Date;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    format?: string;
}
