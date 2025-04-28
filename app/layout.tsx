import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TooltipProvider, SidebarProvider, Toaster } from "@/components/ui";
import SessionProviderWrapper from "@/context/session-provider-context";
import { ThemeProvider } from "@/context/next-theme-context";

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
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body className={`${poppins.className} antialiased w-full`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
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
                </ThemeProvider>
            </body>
        </html>
    );
}
