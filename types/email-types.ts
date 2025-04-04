import { ReactElement } from "react";

export interface EmailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}

export type EmailTemplate<T = any> = (props: T) => ReactElement;
