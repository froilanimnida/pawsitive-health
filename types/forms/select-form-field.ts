import BaseFormField from "@/types/forms/base-fields";

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectFormField extends BaseFormField {
    name: string;
    options: SelectOption[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    isSearchable?: boolean;
}
