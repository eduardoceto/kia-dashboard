import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function DashboardCard({ title, className, children }: DashboardCardProps) {
  return (
    <section
      className={cn(
        "bg-[#101a26] rounded-xl shadow p-6 w-full",
        className
      )}
    >
      {title && (
        <header className="mb-4 text-lg font-bold text-foreground KiaSignatureBold flex items-center gap-2">
          {title}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
} 