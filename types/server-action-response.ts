export type ActionResponse<T = void> =
    | { success: true; data: T; revalidated?: boolean }
    | { success: false; error: string };
