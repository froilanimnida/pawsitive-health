import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { appointment_status } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const userId = Number(session.user.id);

        // Current date
        const now = new Date();

        // Fetch upcoming appointments for the user that are in the future and confirmed/pending
        const appointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: userId,
                },
                appointment_date: {
                    gte: now, // Only get appointments from now onwards
                },
                status: {
                    in: [appointment_status.confirmed, appointment_status.confirmed],
                },
            },
            include: {
                pets: {
                    select: {
                        name: true,
                        pet_id: true,
                    },
                },
                veterinarians: {
                    select: {
                        vet_id: true,
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
                clinics: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                appointment_date: "asc",
            },
        });

        return NextResponse.json({
            appointments,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
        return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
    }
}
