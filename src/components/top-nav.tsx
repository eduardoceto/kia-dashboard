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
import { useManager } from "@/src/hooks/useManager"
import { usePathname } from "next/navigation"
import { routing } from "@/src/i18n/routing"; // Import routing from the correct file


interface BreadcrumbItem {
    label: string
    href?: string
}

type Props = {
    children?: React.ReactNode;
    userProfile: UserProfile; // Add userProfile prop
}

// Make sure TopNav accepts props
export default function TopNav({ children, userProfile }: Props) {
    const t = useTranslations('top-nav');
    const manager = useManager().isManager;
    const pathname = usePathname();

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
    const localeSegment = routing.locales.includes(rawSegments[0] as any) ? rawSegments[0] : null;
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


    const profileName = userProfile?.full_name || "User";
    const profileRole = userProfile?.role || "User";

    return (
        <header
            className="Formula1 w-full bg-color-primary text-white z-10 "
            style={{ height: "64px" }}>
            <nav className="px-3 sm:px-6 flex items-center justify-between h-full">
                 <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
                    {breadcrumbs.map((item, index) => (
                        <div key={item.label + index} className="flex items-center">
                            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-500 mx-1" />}
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

                <div className="flex items-center gap-2 sm:gap-4 ml-auto relative right-4">
                    <LanguageSwitcher />
                </div>

                <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0 ">
                    <button
                        type="button"
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
                            {/* Pass props down to Profile01 */}
                            <Profile01
                                name={profileName}
                                role={profileRole}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
        </header>
    )
}
