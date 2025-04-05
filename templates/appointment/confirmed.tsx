import React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Link } from "@react-email/components";

function generateGoogleCalendarUrl({
    title,
    description,
    location,
    startDateTime,
    endDateTime,
}: {
    title: string;
    description: string;
    location: string;
    startDateTime: Date;
    endDateTime: Date;
}): string {
    const formatDate = (date: Date): string => {
        return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedLocation = encodeURIComponent(location);
    const startDate = formatDate(startDateTime);
    const endDate = formatDate(endDateTime);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDescription}&location=${encodedLocation}&dates=${startDate}/${endDate}`;
}

export interface AppointmentConfirmedEmailProps {
    petName: string;
    ownerName: string;
    vetName: string;
    date: string;
    time: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
    appointmentType: string;
    appointmentId: string;
    instructions?: string;
    appointmentDateTime: Date;
    appointmentEndDateTime: Date;
}

export default function AppointmentConfirmed({
    petName,
    ownerName,
    vetName,
    date,
    time,
    clinicName,
    clinicAddress,
    clinicPhone,
    appointmentType,
    appointmentId,
    instructions,
    appointmentDateTime,
    appointmentEndDateTime,
}: AppointmentConfirmedEmailProps) {
    const googleCalendarUrl = generateGoogleCalendarUrl({
        title: `Vet Appointment for ${petName}`,
        description: `Appointment with Dr. ${vetName} for ${petName}.\n\nType: ${appointmentType}\n\nClinic: ${clinicName}\nPhone: ${clinicPhone}\n${instructions ? `\nSpecial Instructions: ${instructions}` : ""}`,
        location: clinicAddress,
        startDateTime: appointmentDateTime,
        endDateTime: appointmentEndDateTime,
    });
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2" style={styles.title}>
                            Your Appointment Has Been Confirmed
                        </Heading>

                        <Text style={styles.greeting}>Hello {ownerName},</Text>

                        <Text>
                            Great news! Your appointment for {petName} has been confirmed by Dr. {vetName}. Please find
                            the details below:
                        </Text>

                        <Section style={styles.details}>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Appointment ID:</span> #{appointmentId}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Appointment Type:</span> {appointmentType}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Date:</span> {date}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Time:</span> {time}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Veterinarian:</span> Dr. {vetName}
                            </Text>
                            <Hr style={styles.detailDivider} />
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Location:</span> {clinicName}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Address:</span> {clinicAddress}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Phone:</span> {clinicPhone}
                            </Text>
                        </Section>

                        {instructions && (
                            <Section style={styles.instructions}>
                                <Heading as="h3" style={styles.instructionsTitle}>
                                    Special Instructions
                                </Heading>
                                <Text>{instructions}</Text>
                            </Section>
                        )}

                        <Section style={styles.calendarSection}>
                            <Heading as="h3" style={styles.calendarTitle}>
                                Add to Calendar
                            </Heading>
                            <div style={styles.calendarButtons}>
                                <Link href={googleCalendarUrl} style={styles.calendarButton}>
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                                        width="20"
                                        height="20"
                                        alt="Google Calendar"
                                        style={{ marginRight: "8px", verticalAlign: "middle" }}
                                    />
                                    Google Calendar
                                </Link>
                            </div>
                        </Section>

                        <Text style={styles.reminder}>
                            Please arrive 10 minutes before your scheduled appointment time. If you need to reschedule
                            or cancel, please do so at least 24 hours in advance.
                        </Text>

                        <Hr style={styles.divider} />

                        <Section style={styles.buttonContainer}>
                            <Button
                                style={styles.button}
                                href={`${process.env.FRONTEND_URL}/u/appointments/view/${appointmentId}`}
                            >
                                View Appointment
                            </Button>
                        </Section>
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
    calendarSection: {
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #e2e8f0",
        textAlign: "center" as const,
    },
    calendarTitle: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "0 0 12px",
        color: "#334155",
    },
    calendarButtons: {
        display: "flex",
        justifyContent: "center" as const,
        marginTop: "10px",
    },
    calendarButton: {
        backgroundColor: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
        color: "#334155",
        display: "inline-block",
        fontSize: "14px",
        fontWeight: "medium",
        padding: "8px 16px",
        textDecoration: "none",
        margin: "0 8px",
    },

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
    title: {
        color: "#111827",
        fontSize: "24px",
        fontWeight: "bold",
        textAlign: "center" as const,
        margin: "0 0 24px",
    },
    greeting: {
        fontSize: "16px",
        lineHeight: "24px",
        margin: "16px 0",
    },
    details: {
        backgroundColor: "#f0f9ff",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #e0f2fe",
    },
    detailRow: {
        margin: "8px 0",
        fontSize: "15px",
    },
    detailLabel: {
        fontWeight: "bold",
        color: "#0369a1",
    },
    detailDivider: {
        borderColor: "#e0f2fe",
        margin: "12px 0",
    },
    instructions: {
        backgroundColor: "#fffbeb",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #fef3c7",
    },
    instructionsTitle: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "0 0 8px",
        color: "#92400e",
    },
    reminder: {
        fontSize: "14px",
        color: "#4b5563",
        margin: "16px 0",
        fontStyle: "italic",
    },
    divider: {
        borderColor: "#e5e7eb",
        margin: "20px 0",
    },
    buttonContainer: {
        textAlign: "center" as const,
        margin: "24px 0",
    },
    button: {
        backgroundColor: "#3b82f6",
        borderRadius: "6px",
        color: "#ffffff",
        display: "inline-block",
        fontSize: "14px",
        fontWeight: "bold",
        padding: "12px 24px",
        textDecoration: "none",
        textTransform: "uppercase" as const,
        letterSpacing: "0.025em",
    },
    footer: {
        color: "#6b7280",
        fontSize: "12px",
        marginTop: "20px",
        textAlign: "center" as const,
    },
};
