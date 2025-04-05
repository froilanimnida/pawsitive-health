import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { EmailTemplate, EmailOptions } from "@/types/email-types";

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendMail<T>(template: EmailTemplate<T>, data: T, options: EmailOptions): Promise<boolean> {
        try {
            const html = await render(template(data));

            await this.transporter.sendMail({
                from: options.from || process.env.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                html,
                text: options.text,
            });

            return true;
        } catch {
            return false;
        }
    }

    async sendSimpleEmail(options: EmailOptions): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: options.from || process.env.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            return true;
        } catch {
            return false;
        }
    }
}

export { EmailService };
