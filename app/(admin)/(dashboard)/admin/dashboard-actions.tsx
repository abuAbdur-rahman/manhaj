"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export function DashboardActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/admin/episodes/new"
        className={cn(buttonVariants({ variant: "primary" }), "gap-2")}
      >
        <Plus className="h-4 w-4" />
        New episode
      </Link>
      <Link
        href="/admin/series"
        className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
      >
        <Plus className="h-4 w-4" />
        New series
      </Link>
    </div>
  );
}

export function CreateEpisodeAction() {
  return (
    <Link
      href="/admin/episodes/new"
      className={buttonVariants({ variant: "primary" })}
    >
      Create episode
    </Link>
  );
}
