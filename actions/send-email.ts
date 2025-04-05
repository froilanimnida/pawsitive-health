"use server";
import { EmailService } from "@/lib/email-service";
import type { EmailTemplate, EmailOptions } from "@/types/email-types";
import type { ActionResponse } from "@/types/server-action-response";

const emailService = new EmailService();

/**
 * Server action to send an email with a template
 */
export async function sendEmail<T>(
    template: EmailTemplate<T>,
    data: T,
    options: EmailOptions,
): Promise<ActionResponse<{ sent: boolean }>> {
    try {
        const success = await emailService.sendMail(template, data, options);

        return {
            success: true,
            data: { sent: success },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
        };
    }
}

/**
 * Server action to send a simple email without a template
 */
export async function sendSimpleEmail(options: EmailOptions): Promise<ActionResponse<{ sent: boolean }>> {
    try {
        const success = await emailService.sendSimpleEmail(options);

        return {
            success: true,
            data: { sent: success },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
        };
    }
}
