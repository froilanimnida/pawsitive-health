import React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from "@react-email/components";

export interface ClinicOnboardingEmailProps {
    firstName: string;
    lastName: string;
    clinicName: string;
    verificationUrl: string;
    expiresIn: string;
}

export default function ClinicOnboardingEmail({
    firstName,
    lastName,
    clinicName,
    verificationUrl,
    expiresIn,
}: ClinicOnboardingEmailProps) {
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
                            Thank you for registering your clinic <strong>{clinicName}</strong> with PawsitiveHealth. To
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

                        <Section style={styles.infoSection}>
                            <Text style={styles.infoHeading}>What's Next?</Text>
                            <Text>After verification, you can:</Text>
                            <ul style={styles.list}>
                                <li>Complete your clinic profile</li>
                                <li>Add veterinarians to your practice</li>
                                <li>Set up your availability</li>
                                <li>Start accepting appointments</li>
                            </ul>
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
                        Thank you for choosing PawsitiveHealth for your veterinary practice.
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
    infoSection: {
        backgroundColor: "#f0f7ff",
        borderRadius: "4px",
        margin: "20px 0",
        padding: "15px",
    },
    infoHeading: {
        fontWeight: "bold",
        fontSize: "16px",
        marginBottom: "10px",
    },
    list: {
        margin: "10px 0 10px 20px",
        paddingLeft: "0",
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
