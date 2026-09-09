"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";

export function Tabs({ ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />;
}

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-sand-100 p-1 text-sand-300 dark:bg-ink-800 dark:text-ink-500",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold whitespace-nowrap",
        "motion-safe:transition-all motion-safe:duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-white data-[state=active]:text-forest-700 data-[state=active]:shadow-sm",
        "dark:data-[state=active]:bg-ink-700 dark:data-[state=active]:text-ink-100",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-4 page-enter focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
        className,
      )}
      {...props}
    />
  );
}
