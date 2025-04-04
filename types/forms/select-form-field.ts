import BaseFormField from "@/types/forms/base-fields";

export interface SelectOption<T = string> {
    label: string;
    value: T;
}

export interface SelectFormField<T = string> extends BaseFormField {
    name: string;
    options: SelectOption<T>[];
    defaultValue?: T;
    onChange?: (value: T) => void;
    isSearchable?: boolean;
}
