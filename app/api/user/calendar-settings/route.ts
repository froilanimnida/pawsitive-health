import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        // Get authenticated user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // Get calendar settings
        const settings = await prisma.user_settings.findUnique({
            where: { user_id: Number(session.user.id) },
        });

        if (!settings) return NextResponse.json({ error: "Settings not found" }, { status: 404 });
        return NextResponse.json({
            googleCalendarSync: settings.google_calendar_sync,
            lastSync: settings.last_sync,
        });
    } catch (error) {
        console.error("Error fetching calendar settings:", error);
        return NextResponse.json({ error: "Failed to fetch calendar settings" }, { status: 500 });
    }
}
