import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";

async function AdminLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <div className="flex h-screen">
            <AppSidebar variant="floating" />
            {children}
        </div>
    );
}

export default AdminLayout;
