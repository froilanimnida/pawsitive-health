import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import SessionProviderWrapper from "@/context/session-provider-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui";

const poppins = Poppins({
    variable: "--poppins-font",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    preload: true,
    adjustFontFallback: true,
    display: "swap",
    subsets: ["latin-ext", "latin"],
    fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
    title: "PawsitiveHealth | Home",
    description: "PawsitiveHealth is a pet health care service.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.className} antialiased w-full`}>
                <SidebarProvider>
                    <TooltipProvider>
                        <SessionProviderWrapper>
                            {children}
                            <Toaster
                                toastOptions={{
                                    className: "max-w-sm",
                                    style: {
                                        background: "#fff",
                                        color: "#000",
                                    },
                                }}
                            />
                        </SessionProviderWrapper>
                    </TooltipProvider>
                </SidebarProvider>
            </body>
        </html>
    );
}
