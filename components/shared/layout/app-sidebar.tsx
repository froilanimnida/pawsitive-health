"use client";
import { ComponentProps } from "react";
import {
    Settings2,
    Dog,
    Stethoscope,
    Building,
    User2,
    FlaskConical,
    CalendarCheck2,
    PanelsTopLeft,
} from "lucide-react";
import { NavMenus } from "@/components/shared/layout/nav-menus";
import { NavUser } from "@/components/shared/layout/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

const userNavLinks = [
    {
        name: "Settings",
        url: "/user/settings",
        icon: Settings2,
    },
    {
        name: "My Pets",
        url: "/user/pets",
        icon: Dog,
    },
    {
        name: "My Booking",
        url: "/user/appointments",
        icon: CalendarCheck2,
    },
    {
        name: "Forum",
        url: "/user/forum",
        icon: PanelsTopLeft,
    },
];

const vetNavLinks = [
    {
        name: "Appointments",
        url: "/vet/appointments",
        icon: CalendarCheck2,
    },
    {
        name: "Forum",
        url: "/vet/forum",
        icon: PanelsTopLeft,
    },
];

const clientNavLinks = [
    {
        name: "Clinic Appointments",
        url: "/clinic/appointments",
        icon: CalendarCheck2,
    },
    {
        name: "Veterinaries",
        url: "/clinic/vets",
        icon: Stethoscope,
    },
];

const adminNavLinks = [
    {
        name: "Clinics",
        url: "/admin/clinics",
        icon: Building,
    },
    {
        name: "Users",
        url: "/admin/users",
        icon: User2,
    },

    {
        name: "Medicine",
        url: "/admin/medicine",
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
