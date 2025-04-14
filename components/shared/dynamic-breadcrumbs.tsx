import { Fragment } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui";
import { headers } from "next/headers";

export async function DynamicBreadcrumbs() {
    const header = await headers();
    const pathname = header.get("x-pathname") || "";
    const segments = pathname.split("/").filter(Boolean);

    const formatSegment = (segment: string) => {
        if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return "Details";
        }
        return segment
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <Breadcrumb aria-label="Breadcrumb">
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    if (index === 0) {
                        return (
                            <BreadcrumbItem key={segment}>
                                <BreadcrumbLink asChild>
                                    <Link href={`/${segment}`}>
                                        <Home className="h-4 w-4" />
                                        <span className="sr-only">Home</span>
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        );
                    }
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;

                    return (
                        <Fragment key={segment}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={href}>{formatSegment(segment)}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
