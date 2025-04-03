import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import SessionProviderWrapper from "@/context/session-provider-context";
import { SidebarProvider } from "@/components/ui/sidebar";

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
            <body className={`${poppins.className} antialiased`}>
                <SidebarProvider>
                    <TooltipProvider>
                        <SessionProviderWrapper>
                            {children}
                            <Toaster />
                        </SessionProviderWrapper>
                    </TooltipProvider>
                </SidebarProvider>
            </body>
        </html>
    );
}
