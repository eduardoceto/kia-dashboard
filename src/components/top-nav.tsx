"use client" // Ensure TopNav is a client component if it wasn't already

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import Image from "next/image"
import { Bell, ChevronRight } from "lucide-react"
import Profile01 from "./profile-01" // Import Profile01
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import LanguageSwitcher from "./languageSwitcher"
import { useTranslations } from 'next-intl';
import { FaUserClock } from "react-icons/fa"; // Import the icon here
import { UserProfile } from "@/types";



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

    const breadcrumbs: BreadcrumbItem[] = [
        { label: t('title') },
        { label: t('dashboard'), href: "/dashboard" },
    ]

    const profileName = userProfile.employee_id ?? 'User';
    const profileRole = userProfile.role ?? 'Role';

    return (
        <header
            className="Formula1 w-full border-b border-gray-200 dark:border-[#1F1F23] z-10 bg-white dark:bg-[#0F0F12]" // Added background color
            style={{ height: "64px" }}>
            <nav className="px-3 sm:px-6 flex items-center justify-between h-full">
                 <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
                    {breadcrumbs.map((item, index) => (
                    <div key={item.label} className="flex items-center">
                        {index > 0 && <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />}
                        {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            {item.label}
                        </Link>
                        ) : (
                        <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
                        )}
                    </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-4 ml-auto relative right-4">
                    <LanguageSwitcher />
                </div>

                <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
                    <button
                        type="button"
                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
                    >
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                                <FaUserClock className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer text-gray-600 dark:text-gray-300 p-1" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
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
