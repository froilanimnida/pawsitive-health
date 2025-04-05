import React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from "@react-email/components";

export interface AppointmentEmailProps {
    petName: string;
    ownerName: string;
    vetName: string;
    date: string;
    time: string;
    clinicName: string;
    clinicAddress: string;
    appointmentType: string;
}

export default function AppointmentConfirmation({
    petName,
    ownerName,
    vetName,
    date,
    time,
    clinicName,
    clinicAddress,
    appointmentType,
}: AppointmentEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2">Appointment Confirmation</Heading>
                        <Text>Hello {ownerName},</Text>
                        <Text>
                            This email confirms your appointment for {petName} with Dr. {vetName}.
                        </Text>

                        <Section style={styles.details}>
                            <Text>
                                <strong>Appointment Type:</strong> {appointmentType}
                            </Text>
                            <Text>
                                <strong>Date:</strong> {date}
                            </Text>
                            <Text>
                                <strong>Time:</strong> {time}
                            </Text>
                            <Text>
                                <strong>Location:</strong> {clinicName}
                            </Text>
                            <Text>
                                <strong>Address:</strong> {clinicAddress}
                            </Text>
                        </Section>

                        <Hr style={styles.divider} />

                        <Button style={styles.button} href={`${process.env.FRONTEND_URL}/u/appointments`}>
                            Manage Your Appointments
                        </Button>
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
    details: {
        backgroundColor: "#f9fafb",
        borderRadius: "4px",
        margin: "20px 0",
        padding: "15px",
    },
    divider: {
        borderColor: "#e5e7eb",
        margin: "20px 0",
    },
    button: {
        backgroundColor: "#3b82f6",
        borderRadius: "4px",
        color: "#ffffff",
        display: "inline-block",
        padding: "10px 20px",
        textDecoration: "none",
        textAlign: "center" as const,
        margin: "20px 0",
    },
    footer: {
        color: "#6b7280",
        fontSize: "12px",
        marginTop: "20px",
        textAlign: "center" as const,
    },
};
