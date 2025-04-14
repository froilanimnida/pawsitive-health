"use client";

import type { ReactNode } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

type ConfirmationDialogProps = {
    trigger: ReactNode;
    title: string;
    description: string | ReactNode;
    actionButtons?: ReactNode | ReactNode[];
    cancelButtonText?: string;
    size?: DialogSize;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
    showCancel?: boolean;
    closeOnAction?: boolean;
    children?: ReactNode;
};

export function ConfirmationDialog({
    trigger,
    title,
    description,
    actionButtons,
    cancelButtonText = "Cancel",
    size = "md",
    className,
    headerClassName,
    contentClassName,
    footerClassName,
    showCancel = true,
    closeOnAction = true,
    children,
}: ConfirmationDialogProps) {
    const sizeClasses: Record<DialogSize, string> = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "max-w-full",
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={cn(sizeClasses[size], className)}>
                <DialogHeader className={headerClassName}>
                    <DialogTitle>{title}</DialogTitle>
                    {typeof description === "string" ? (
                        <DialogDescription>{description}</DialogDescription>
                    ) : (
                        description
                    )}
                </DialogHeader>

                {children && <div className={cn("py-4", contentClassName)}>{children}</div>}

                <DialogFooter className={cn("flex justify-end gap-2", footerClassName)}>
                    {Array.isArray(actionButtons)
                        ? actionButtons.map((button, index) => (
                              <div key={index} className={closeOnAction ? "contents" : undefined}>
                                  {closeOnAction ? <DialogClose asChild>{button}</DialogClose> : button}
                              </div>
                          ))
                        : actionButtons &&
                          (closeOnAction ? <DialogClose asChild>{actionButtons}</DialogClose> : actionButtons)}

                    {showCancel && (
                        <DialogClose asChild>
                            <Button variant="outline">{cancelButtonText}</Button>
                        </DialogClose>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
