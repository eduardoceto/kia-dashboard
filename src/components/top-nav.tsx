"use client" // Ensure TopNav is a client component if it wasn't already

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Bell, ChevronRight } from "lucide-react"
import Profile01 from "./profile-01" // Import Profile01
import Link from "next/link"
import LanguageSwitcher from "./languageSwitcher"
import { useTranslations } from 'next-intl';
import { FaCircleUser } from "react-icons/fa6"; // Import the icon here
import { UserProfile } from "@/types";
import { PiUserCircleGearFill } from "react-icons/pi";
import { usePathname } from "next/navigation"
import { useUser } from "@/src/hooks/useUser";
import formatUserName from "@/src/utils/formatUserName";


interface BreadcrumbItem {
    label: string
    href?: string
}

type Props = {
    userProfile?: UserProfile; // Add userProfile prop
}

// Make sure TopNav accepts props
export default function TopNav({ userProfile }: Props) {
    const t = useTranslations('top-nav');
    const manager = useUser().isManager;
    const pathname = usePathname();
    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Helper to format path segments (no longer needs to handle locales)
    function formatSegment(segment: string): string {
        if (!segment) return ""; // Should generally not happen due to filter(Boolean)
        // Use the segment itself as a fallback if the translation key is not found
        const fallbackMessage = segment
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase());
        // Pass the fallback message in the values object (second argument)
        // Remove the incorrect third argument
        return t(segment, { defaultMessage: fallbackMessage });
    }

    // Build breadcrumbs from pathname, handling locale prefix
    const rawSegments = pathname.split("/").filter(Boolean);
    // Check against the imported 'locales' array from routing object
    const localeSegment = (rawSegments[0] === 'en' || rawSegments[0] === 'es') ? rawSegments[0] : null;
    const displaySegments = localeSegment ? rawSegments.slice(1) : rawSegments;
    const baseHref = localeSegment ? `/${localeSegment}` : '/';

    const breadcrumbs: BreadcrumbItem[] = [
        { label: t('title'), href: baseHref }, // Use baseHref which includes locale if present
        ...displaySegments.map((seg, idx) => {
            const label = formatSegment(seg);
            // Find the correct index in the original segments array
            const originalIndex = localeSegment ? idx + 1 : idx;
            const href = "/" + rawSegments.slice(0, originalIndex + 1).join("/");
            return { label, href };
        })
    ];


const profileName = formatUserName(userProfile);
    const profileRole = userProfile?.role || "User";

    return (
        <header className="Formula1 w-full bg-[#101a26] text-white z-10 shadow-sm" style={{ minHeight: "80px" }}>
            <div className="flex flex-col w-full px-3 sm:px-8 pt-3 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-2xl font-bold leading-tight">Hello, {profileName}</span>
                        <span className="text-base text-gray-300">How can I help you today?</span>
                        <span className="text-xs text-gray-400 mt-1">{today}</span>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        <button className="px-4 py-2 bg-[#232e3c] text-white text-sm font-medium border border-[#232e3c] hover:bg-[#3b4a5a] transition-colors rounded-md" aria-label="+ Add Task" type="button">+ Add Task</button>
                        <button className="px-4 py-2 bg-[#232e3c] text-white text-sm font-medium border border-[#232e3c] hover:bg-[#3b4a5a] transition-colors rounded-md" aria-label="Get Updates" type="button">Get Updates</button>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-between mt-2 w-full">
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
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        <LanguageSwitcher />
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="p-1.5 sm:p-2 text-white hover:bg-gray-100 hover:text-[#05141F] rounded-full transition-colors"
                        >
                            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                {manager ? (
                                    <PiUserCircleGearFill className="rounded-full ring-2 ring-white sm:w-8 sm:h-8 cursor-pointer text-white p-0.9" />
                                ) : (
                                    <FaCircleUser className="rounded-full size-max ring-2 ring-white sm:w-8 sm:h-8 cursor-pointer text-white p-0.9" />
                                )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-[280px] bg-[#1f2c35] sm:w-80 border-foreground rounded-lg shadow-lg"
                            >
                                <Profile01
                                    name={profileName}
                                    role={profileRole}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}
