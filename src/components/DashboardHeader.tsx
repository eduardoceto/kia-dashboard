"use client";
import { useUser } from "@/src/hooks/useUser";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { routing } from "@/src/i18n/routing";
import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  variant?: "dashboard" | "page";
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function DashboardHeader({ variant = "dashboard", title, actions }: DashboardHeaderProps) {
  const { profile } = useUser();
  const pathname = usePathname();
  const [today, setToday] = useState("");
  const t = useTranslations('dashboardPage');
  useEffect(() => {
    const date = new Date();
    setToday(date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  // Breadcrumbs logic (copied from TopNav)
  function formatSegment(segment: string): string {
    if (!segment) return "";
    return segment.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
  const rawSegments = pathname.split("/").filter(Boolean);
  const localeSegment = routing.locales.includes(rawSegments[0] as (typeof routing.locales)[number]) ? rawSegments[0] : null;
  const displaySegments = localeSegment ? rawSegments.slice(1) : rawSegments;
  const baseHref = localeSegment ? `/${localeSegment}` : '/';
  const breadcrumbs = [
    { label: t('dashboard'), href: baseHref + "/dashboard" },
    ...displaySegments.slice(1).map((seg, idx) => {
      const label = formatSegment(seg);
      const originalIndex = localeSegment ? idx + 2 : idx + 1;
      const href = "/" + rawSegments.slice(0, originalIndex + 1).join("/");
      return { label, href };
    })
  ];

  const profileName = (profile?.first_name ? profile.first_name + " " : "") + (profile?.last_name || "User");

  return (
    <div className="w-full mx-auto bg-[#101a26] rounded-xl shadow p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="flex flex-col gap-0.5">
          {variant === "dashboard" ? (
            <>
              <span className="text-2xl font-bold leading-tight text-white">{t('hello', { name: profileName })}</span>
              <span className="text-xs text-gray-400 mt-1">{today}</span>
            </>
          ) : (
            <>
              {title && <span className="text-2xl font-bold leading-tight text-white">{title}</span>}
              <span className="text-xs text-gray-400 mt-1">{today}</span>
            </>
          )}
        </div>
        {variant === "page" && actions && (
          <div className="flex gap-2 mt-4 sm:mt-0">{actions}</div>
        )}
      </div>
      <div className="flex flex-row items-center mt-4 w-full">
        <div className="font-medium text-xs flex items-center space-x-1 truncate max-w-[400px] text-gray-400">
          {breadcrumbs.map((item, index) => (
            <div key={item.label + index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 text-gray-500 mx-1" />}
              {item.href && index !== breadcrumbs.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="hover:underline">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 