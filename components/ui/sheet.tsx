"use client";

import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { Drawer } from "vaul";
import { cn } from "@/components/ui/cn";

export function Sheet({
  children,
  ...props
}: ComponentProps<typeof Drawer.Root>) {
  return <Drawer.Root {...props}>{children}</Drawer.Root>;
}

export function SheetTrigger({
  children,
  ...props
}: ComponentProps<typeof Drawer.Trigger>) {
  return <Drawer.Trigger {...props}>{children}</Drawer.Trigger>;
}

export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Drawer.Content>) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Drawer.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-xl bg-white dark:bg-ink-900",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-sand-200 dark:bg-ink-700" />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export function SheetHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between px-4 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof Drawer.Title>) {
  return (
    <Drawer.Title
      className={cn(
        "text-lg font-semibold text-forest-900 dark:text-ink-100",
        className,
      )}
      {...props}
    />
  );
}

export function SheetClose({
  className,
  ...props
}: ComponentProps<typeof Drawer.Close>) {
  return (
    <Drawer.Close
      className={cn(
        "rounded-full p-1 text-sand-300 transition-colors hover:text-forest-700 dark:text-ink-500 dark:hover:text-ink-100",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Drawer.Close>
  );
}
