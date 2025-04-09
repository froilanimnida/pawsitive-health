import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { SidebarTrigger } from "@/components/ui";
import { DynamicBreadcrumbs } from "@/components/shared/dynamic-breadcrumbs";

async function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="min-h-screen w-full flex flex-row">
            <AppSidebar variant="sidebar" />
            <div className="flex-1 flex flex-col">
                <header className="border-b p-4 flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <DynamicBreadcrumbs />
                </header>
                <section className="flex-1">
                    <aside className="p-4 w-full h-full">{children}</aside>
                </section>
            </div>
        </main>
    );
}

export default UserLayout;
