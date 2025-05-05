import { Html, Head, Body, Container, Section, Heading, Text, Hr, Button } from "@react-email/components";

export default function PasswordResetEmail({
    firstName,
    lastName,
    resetUrl,
    expiresIn,
}: {
    firstName: string;
    lastName: string;
    resetUrl: string;
    expiresIn: string;
}) {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2">Password Reset Request</Heading>
                        <Text>
                            Hello {firstName} {lastName},
                        </Text>
                        <Text>
                            We&apos;ve received a request to reset your password for your PawsitiveHealth account. Click
                            the button below to reset your password.
                        </Text>

                        <Section style={styles.buttonSection}>
                            <Button href={resetUrl}>Reset Password</Button>
                            <Text style={styles.note}>This link will expire in {expiresIn}.</Text>
                        </Section>

                        <Text style={styles.linkText}>
                            If the button doesn&apos;t work, copy and paste this link into your browser:
                            <br />
                            <a href={resetUrl} style={styles.link}>
                                {resetUrl}
                            </a>
                        </Text>

                        <Hr style={styles.divider} />

                        <Section style={styles.securitySection}>
                            <Text style={styles.securityHeading}>Security Notice</Text>
                            <Text>
                                If you did not request this password reset, please ignore this email or contact support
                                immediately. Someone may be trying to access your account.
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
    buttonSection: {
        margin: "25px 0",
        textAlign: "center" as const,
    },
    button: {
        backgroundColor: "#3b82f6",
        borderRadius: "4px",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
        padding: "12px 20px",
        textDecoration: "none",
        textTransform: "uppercase",
        cursor: "pointer",
    },
    linkText: {
        margin: "15px 0",
        fontSize: "14px",
        color: "#64748b",
    },
    link: {
        color: "#3b82f6",
        display: "block",
        wordBreak: "break-all" as const,
        marginTop: "5px",
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
