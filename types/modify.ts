/**
 * Utility type that allows modifying specific properties of a type while maintaining type safety
 * @template T - The original type to modify
 * @template R - A partial record of properties to override in T
 */
export type Modify<T, R> = Omit<T, keyof R> & R;
