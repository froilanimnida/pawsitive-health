//import { Fragment } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    //BreadcrumbPage,
    //BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { headers } from "next/headers";

export async function DynamicBreadcrumbs() {
    const header = await headers();
    const pathname = header.get("x-pathname");
    console.log(pathname);

    // Skip empty segments and remove any trailing slashes
    // const segments = pathname.split("/").filter(Boolean);

    // Function to format segment text
    // const formatSegment = (segment: string) => {
    //     // If segment is a UUID, show a simpler text
    //     if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    //         return "Details";
    //     }
    //
    //     // Format standard segments: replace hyphens with spaces and capitalize words
    //     return segment
    //         .replace(/-/g, " ")
    //         .split(" ")
    //         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //         .join(" ");
    // };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {/*{segments.map((segment, index) => {*/}
                {/*    // Build the href for this segment*/}
                {/*    const href = `/${segments.slice(0, index + 1).join("/")}`;*/}
                {/*    const isLast = index === segments.length - 1;*/}

                {/*    return (*/}
                {/*        <Fragment key={segment}>*/}
                {/*            <BreadcrumbSeparator />*/}
                {/*            <BreadcrumbItem>*/}
                {/*                {isLast ? (*/}
                {/*                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>*/}
                {/*                ) : (*/}
                {/*                    <BreadcrumbLink asChild>*/}
                {/*                        <Link href={href}>{formatSegment(segment)}</Link>*/}
                {/*                    </BreadcrumbLink>*/}
                {/*                )}*/}
                {/*            </BreadcrumbItem>*/}
                {/*        </Fragment>*/}
                {/*    );*/}
                {/*})}*/}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
