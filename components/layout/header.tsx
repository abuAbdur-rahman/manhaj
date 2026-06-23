"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

interface HeaderProps {
  className?: string;
  children?: ReactNode;
}

interface HeaderLeftProps {
  type: "logo" | "back" | "breadcrumb";
  label?: string;
  href?: string;
  segments?: { label: string; href: string }[];
}

interface HeaderCenterProps {
  title: string;
  subtitle?: string;
}

interface HeaderRightProps {
  children: ReactNode;
}

function HeaderLeft({ type, label, href, segments }: HeaderLeftProps) {
  const router = useRouter();

  if (type === "logo") {
    return (
      <Link href="/" className="flex items-center gap-2">
        <span className="text-lg font-semibold text-forest-700">Manhaj</span>
      </Link>
    );
  }

  if (type === "back") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (href ? router.push(href) : router.back())}
        aria-label={`Back to ${label ?? "previous page"}`}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  }

  if (type === "breadcrumb" && segments) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
        {segments.map((segment, i) => (
          <span key={segment.href} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-sand-300" aria-hidden="true">
                /
              </span>
            )}
            <Link
              href={segment.href}
              className="text-forest-700 hover:text-forest-900 transition-colors"
            >
              {segment.label}
            </Link>
          </span>
        ))}
      </nav>
    );
  }

  return null;
}

function HeaderCenter({ title, subtitle }: HeaderCenterProps) {
  return (
    <div className="flex flex-col items-center justify-center min-w-0">
      <span className="text-sm font-semibold text-forest-900 truncate max-w-[200px]">
        {title}
      </span>
      {subtitle && (
        <span className="text-xs text-sand-300 truncate max-w-[200px]">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function HeaderRight({ children }: HeaderRightProps) {
  return <div className="flex items-center gap-2">{children}</div>;
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b border-sand-200 bg-sand-50 px-4 gap-4",
        className,
      )}
    >
      {children}
    </header>
  );
}

export { HeaderLeft, HeaderCenter, HeaderRight };
