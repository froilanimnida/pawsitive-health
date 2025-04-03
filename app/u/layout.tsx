import React from "react";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";

async function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="min-h-screen w-full flex flex-row">
            <section>
                <AppSidebar variant="floating" />
            </section>
            <aside className="p-4 w-full h-full">{children}</aside>
        </main>
    );
}

export default UserLayout;
