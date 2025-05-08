"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { BookOpen, Plus, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        href: "/vet/education",
        label: "My Content",
        icon: ListChecks,
    },
    {
        href: "/vet/education/create",
        label: "Create New",
        icon: Plus,
    },
    {
        href: "/education",
        label: "Browse All Content",
        icon: BookOpen,
    },
];

export function VetEducationNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-2 mb-6">
            {navItems.map((item) => (
                <Button
                    key={item.href}
                    variant={pathname === item.href ? "default" : "outline"}
                    asChild
                    className={cn("gap-2", pathname === item.href && "pointer-events-none")}
                >
                    <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                </Button>
            ))}
        </nav>
    );
}
