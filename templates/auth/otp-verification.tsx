import { Html, Head, Body, Container, Section, Heading, Text, Hr } from "@react-email/components";

export interface OtpEmailProps {
    firstName: string;
    lastName: string;
    otpCode: string;
    expiresIn: string;
}

export default function OtpVerificationEmail({ firstName, lastName, otpCode, expiresIn }: OtpEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2">Verify Your Login</Heading>
                        <Text>
                            Hello {firstName} {lastName},
                        </Text>
                        <Text>
                            We&apos;ve received a request to log in to your PawsitiveHealth account. To complete the login
                            process, please enter the following verification code:
                        </Text>

                        <Section style={styles.codeSection}>
                            <Text style={styles.otpCode}>{otpCode}</Text>
                            <Text style={styles.note}>This code will expire in {expiresIn}.</Text>
                        </Section>

                        <Hr style={styles.divider} />

                        <Section style={styles.securitySection}>
                            <Text style={styles.securityHeading}>Security Notice</Text>
                            <Text>
                                If you did not attempt to log in to your PawsitiveHealth account, please ignore this
                                email and consider changing your password immediately.
                            </Text>
                        </Section>
                    </Section>

                    <Text style={styles.footer}>
                        Thank you for choosing PawsitiveHealth for your pet&apos;s healthcare needs.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: {
        backgroundColor: "#f6f9fc",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
        margin: "0 auto",
        padding: "20px 0",
        width: "580px",
    },
    header: {
        color: "#3b82f6",
        fontSize: "24px",
        fontWeight: "bold",
        padding: "20px 0",
        textAlign: "center" as const,
    },
    section: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        padding: "20px",
    },
    codeSection: {
        backgroundColor: "#f9fafb",
        borderRadius: "4px",
        margin: "20px 0",
        padding: "15px",
        textAlign: "center" as const,
    },
    otpCode: {
        fontSize: "32px",
        fontWeight: "bold",
        letterSpacing: "8px",
        color: "#3b82f6",
        padding: "10px 20px",
        backgroundColor: "#ffffff",
        borderRadius: "4px",
        border: "1px dashed #cbd5e1",
        display: "inline-block",
    },
    divider: {
        borderColor: "#e5e7eb",
        margin: "20px 0",
    },
    securitySection: {
        backgroundColor: "#fff8f8",
        borderRadius: "4px",
        margin: "20px 0 0 0",
        padding: "15px",
        borderLeft: "4px solid #f87171",
    },
    securityHeading: {
        fontWeight: "bold",
        color: "#ef4444",
        marginBottom: "10px",
    },
    note: {
        color: "#6b7280",
        fontSize: "14px",
        marginTop: "10px",
    },
    footer: {
        color: "#6b7280",
        fontSize: "12px",
        marginTop: "20px",
        textAlign: "center" as const,
    },
};
