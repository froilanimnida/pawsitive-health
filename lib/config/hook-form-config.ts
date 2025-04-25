import { UseFormProps, FieldValues } from "react-hook-form";

/**
 * Generic-safe default config with weak typing.
 * Only used for merging and does not impose default type constraints.
 */
export const baseFormConfig = {
    shouldFocusError: true,
    progressive: true,
    mode: "onChange",
    shouldUseNativeValidation: false,
    reValidateMode: "onChange",
} as const;

/**
 * Safely merge default config with user config.
 * Allows full type preservation, especially for defaultValues.
 */
export function createFormConfig<TFieldValues extends FieldValues = FieldValues, TContext = unknown>(
    customConfig: UseFormProps<TFieldValues, TContext>,
): UseFormProps<TFieldValues, TContext> {
    return {
        ...baseFormConfig,
        ...customConfig,
    };
}
