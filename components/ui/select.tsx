"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";

export function Select({
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-forest-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 text-sand-300 dark:text-ink-500" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "relative z-50 max-h-60 min-w-[8rem] overflow-hidden rounded-lg border border-sand-200 bg-white text-forest-900 shadow-lg dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100",
          position === "popper" && "translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center bg-white dark:bg-ink-900">
          <ChevronDown className="h-4 w-4 rotate-180" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center bg-white dark:bg-ink-900">
          <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex h-10 w-full cursor-pointer select-none items-center rounded-md px-2 text-sm outline-none focus:bg-forest-50 focus:text-forest-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-ink-800 dark:focus:text-ink-100",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectValue({
  ...props
}: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}
