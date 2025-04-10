"use client";
import { ComponentProps } from "react";
import {
    Settings2,
    Dog,
    BookmarkCheckIcon,
    Stethoscope,
    Building,
    User2,
    FlaskConical,
    CalendarCheck2,
} from "lucide-react";
import { NavMenus } from "@/components/shared/layout/nav-menus";
import { NavUser } from "@/components/shared/layout/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

const userNavLinks = [
    {
        name: "Settings",
        url: "/u/settings",
        icon: Settings2,
    },
    {
        name: "My Pets",
        url: "/u/pets",
        icon: Dog,
    },
    {
        name: "My Booking",
        url: "/u/appointments",
        icon: CalendarCheck2,
    },
];

const vetNavLinks = [
    {
        name: "Appointments",
        url: "/v/appointments",
        icon: CalendarCheck2,
    },
];

const clientNavLinks = [
    {
        name: "Clinic Appointments",
        url: "/c/appointments",
        icon: CalendarCheck2,
    },
    {
        name: "Veterinaries",
        url: "/c/vets",
        icon: Stethoscope,
    },
];

const adminNavLinks = [
    {
        name: "Appointments",
        url: "/a/appointments",
        icon: BookmarkCheckIcon,
    },
    {
        name: "Veterinaries",
        url: "/a/vets",
        icon: Stethoscope,
    },
    {
        name: "Clinics",
        url: "/a/clinics",
        icon: Building,
    },
    {
        name: "Users",
        url: "/a/users",
        icon: User2,
    },

    {
        name: "Medicine",
        url: "/a/medicine",
        icon: FlaskConical,
    },
];

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession();
    const userData = {
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        role: session?.user?.role ?? "",
    };

    const getNavLinks = () => {
        if (session?.user?.role === "user") return userNavLinks;
        else if (session?.user?.role === "veterinarian") return vetNavLinks;
        else if (session?.user?.role === "client") return clientNavLinks;
        else if (session?.user?.role === "admin") return adminNavLinks;
        else return userNavLinks;
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent>
                <NavMenus items={getNavLinks()} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
