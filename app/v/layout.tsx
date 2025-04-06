import { AppSidebar } from "@/components/shared/layout/app-sidebar";

async function VeterinaryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen">
            <AppSidebar variant="floating" />
            {children}
        </div>
    );
}

export default VeterinaryLayout;
