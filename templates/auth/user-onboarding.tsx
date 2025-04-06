import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from "@react-email/components";

export interface OnboardingEmailProps {
    firstName: string;
    lastName: string;
    verificationUrl: string;
    expiresIn: string;
}

export default function UserOnboardingEmail({ firstName, lastName, verificationUrl, expiresIn }: OnboardingEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2">Welcome to PawsitiveHealth!</Heading>
                        <Text>
                            Hello {firstName} {lastName},
                        </Text>
                        <Text>
                            Thank you for creating an account with PawsitiveHealth, your pet's healthcare companion. To
                            complete your registration and activate your account, please verify your email address.
                        </Text>

                        <Section style={styles.actionSection}>
                            <Text style={styles.important}>
                                Please click the button below to verify your email address:
                            </Text>
                            <Button style={styles.button} href={verificationUrl}>
                                Verify Email Address
                            </Button>
                            <Text style={styles.note}>This verification link will expire in {expiresIn}.</Text>
                        </Section>

                        <Hr style={styles.divider} />

                        <Text>
                            If you did not create this account, please disregard this email and no action will be taken.
                        </Text>

                        <Text>
                            If you're having trouble clicking the button, copy and paste the URL below into your web
                            browser:
                        </Text>
                        <Text style={styles.link}>{verificationUrl}</Text>
                    </Section>

                    <Text style={styles.footer}>
                        Thank you for choosing PawsitiveHealth for your pet's healthcare needs.
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
    actionSection: {
        backgroundColor: "#f9fafb",
        borderRadius: "4px",
        margin: "20px 0",
        padding: "15px",
        textAlign: "center" as const,
    },
    important: {
        fontWeight: "bold",
        marginBottom: "15px",
    },
    button: {
        backgroundColor: "#3b82f6",
        borderRadius: "4px",
        color: "#ffffff",
        display: "inline-block",
        padding: "10px 20px",
        textDecoration: "none",
        textAlign: "center" as const,
        margin: "10px 0",
    },
    divider: {
        borderColor: "#e5e7eb",
        margin: "20px 0",
    },
    note: {
        color: "#6b7280",
        fontSize: "14px",
        marginTop: "10px",
    },
    link: {
        color: "#3b82f6",
        display: "block",
        fontSize: "14px",
        margin: "10px 0",
        wordBreak: "break-all" as const,
    },
    footer: {
        color: "#6b7280",
        fontSize: "12px",
        marginTop: "20px",
        textAlign: "center" as const,
    },
};
