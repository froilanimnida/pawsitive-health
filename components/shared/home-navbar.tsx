"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, Home, Calendar, User, LogOut, Settings, BookOpen, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavbarProps {
    isAuthenticated?: boolean;
    userRole?: "user" | "client" | "veterinarian" | "admin" | undefined;
    userName?: string;
}

export function Navbar({ isAuthenticated = false, userRole, userName }: NavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" });
    };

    // Get home path based on user role
    const getHomePath = () => {
        if (!userRole) return "/";
        switch (userRole) {
            case "user":
                return "/u";
            case "client":
                return "/c";
            case "veterinarian":
                return "/v";
            case "admin":
                return "/a";
            default:
                return "/";
        }
    };

    // Navigation items based on authentication state
    const navItems = isAuthenticated
        ? [
              {
                  name: "Dashboard",
                  href: getHomePath(),
                  icon: <Home className="h-5 w-5" />,
              },
              {
                  name: "Appointments",
                  href: `${getHomePath()}/appointments`,
                  icon: <Calendar className="h-5 w-5" />,
              },
              {
                  name: "Notifications",
                  href: `${getHomePath()}/notifications`,
                  icon: <Bell className="h-5 w-5" />,
              },
              {
                  name: "Educational Content",
                  href: "/education",
                  icon: <BookOpen className="h-5 w-5" />,
              },
              {
                  name: "Profile",
                  href: `${getHomePath()}/profile`,
                  icon: <User className="h-5 w-5" />,
              },
              {
                  name: "Settings",
                  href: `${getHomePath()}/settings`,
                  icon: <Settings className="h-5 w-5" />,
              },
          ]
        : [
              {
                  name: "Features",
                  href: "/#features",
                  icon: <Home className="h-5 w-5" />,
              },
              {
                  name: "Testimonials",
                  href: "/#testimonials",
                  icon: <User className="h-5 w-5" />,
              },
              {
                  name: "Educational Content",
                  href: "/education",
                  icon: <BookOpen className="h-5 w-5" />,
              },
          ];

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center items-center">
            <div className="flex h-16 justify-between items-center w-11/12 max-w-7xl">
                <div className="flex w-full justify-between items-center">
                    <Link href={isAuthenticated ? getHomePath() : "/"} className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-teal-500" />
                        <span className="font-bold text-xl hidden sm:inline-block">PawsitiveHealth</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <Button variant="outline" onClick={handleSignOut} size="sm">
                                Sign Out
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/auth/login">Login</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/auth/sign-up">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </nav>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                            <div className="flex flex-col h-full">
                                <div className="px-2 py-4 border-b">
                                    <div className="flex items-center mb-4">
                                        <Heart className="h-6 w-6 text-teal-500 mr-2" />
                                        <h2 className="font-bold text-lg">PawsitiveHealth</h2>
                                    </div>
                                    {isAuthenticated && userName && (
                                        <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
                                    )}
                                </div>
                                <nav className="flex-1 px-2 py-4 space-y-1">
                                    {navItems.map((item) => (
                                        <SheetClose asChild key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center px-2 py-3 text-base rounded-md transition-colors",
                                                    pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted",
                                                )}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <span className="mr-3 text-muted-foreground">{item.icon}</span>
                                                {item.name}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>
                                <div className="border-t px-2 py-4">
                                    {isAuthenticated ? (
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center justify-center"
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleSignOut();
                                            }}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col space-y-2">
                                            <SheetClose asChild>
                                                <Button asChild variant="outline" className="w-full">
                                                    <Link href="/auth/login">Login</Link>
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button asChild className="w-full">
                                                    <Link href="/auth/sign-up">Sign Up</Link>
                                                </Button>
                                            </SheetClose>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
