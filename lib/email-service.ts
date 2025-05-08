import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { EmailTemplate, EmailOptions } from "@/types/email-types";

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD?.trim(),
            },
            connectionTimeout: 5000, // 5 seconds
            greetingTimeout: 5000, // 5 seconds
            socketTimeout: 10000, // 10 seconds
        });
    }

    async sendMail<T>(template: EmailTemplate<T>, data: T, options: EmailOptions): Promise<boolean> {
        try {
            const html = await render(template(data));
            const result = await this.transporter.sendMail({
                from: options.from || process.env.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                html,
                text: options.text,
            });
            console.log("Email sent:", result.messageId);
            return true;
        } catch (error) {
            console.error("Failed to send email:", error);
            return false;
        }
    }

    async sendSimpleEmail(options: EmailOptions): Promise<boolean> {
        try {
            const result = await this.transporter.sendMail({
                from: options.from || process.env.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            console.log("Simple email sent:", result.messageId);
            return true;
        } catch (error) {
            console.error("Failed to send simple email:", error);
            return false;
        }
    }

    // Add a verification method to test the connection
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log("Email server connection verified");
            return true;
        } catch (error) {
            console.error("Email server connection failed:", error);
            return false;
        }
    }
}

export { EmailService };
