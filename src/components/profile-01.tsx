// filepath: /Users/eduardo/Library/CloudStorage/OneDrive-Personal/Programacion/Clases/DesarrolloWeb/Dashboard/kia-dashboard/src/components/profile-01.tsx
"use client" // Add "use client" directive

import { Icon, LogOut, MoveUpRight, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "../utils/supabase/client" // Use client Supabase client
import { useRouter } from 'next/navigation' // Import useRouter for redirection
import { IconType } from "react-icons/lib"
import { FaUserClock } from "react-icons/fa" // Import the icon here

interface MenuItem {
    label: string
    value?: string
    href: string
    icon?: React.ReactNode
    external?: boolean
}

interface Profile01Props {
    name: string // Make props required as they are passed down
    role: string
}

// Remove defaultProfile if props are always provided
// const defaultProfile = { ... }

// Remove async, accept props directly
export default function Profile01({ name, role }: Profile01Props) { // Use the renamed prop
    const router = useRouter(); // Get router instance
    const supabase = createClient(); // Create client-side Supabase instance

    const menuItems: MenuItem[] = [
        {
            label: "Settings",
            href: "#", // Update with actual settings path if needed
            icon: <Settings className="w-4 h-4" />,
        },
        // Add other menu items if necessary
    ]

    // Remove server-side data fetching
    // const { data, error } = await supabase.auth.getUser() ...

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            // Optionally show an error message to the user
        } else {
            console.log("User signed out successfully");
            // Redirect to login page after logout
            router.push('/login'); // Adjust path if needed (locale might be handled by middleware)
            router.refresh(); // Refresh server components
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative px-6 pt-12 pb-6">
                    <div className="flex items-center gap-4 mb-8">
                    <div className="relative shrink-0">
                                <FaUserClock
                                    className="rounded-full w-16 h-16 border-2 border-white dark:border-zinc-900 text-gray-600 dark:text-gray-300" // Adjust size/styling as needed
                                />
                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">{role}</p>
                        </div>
                    </div>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-between p-2
                                            hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                                            rounded-lg transition-colors duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                                </div>
                                <div className="flex items-center">
                                    {item.value && <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">{item.value}</span>}
                                    {item.external && <MoveUpRight className="w-4 h-4" />}
                                </div>
                            </Link>
                        ))}

                        <button
                            type="button"
                            className="w-full flex items-center justify-between p-2
                                        hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                                        rounded-lg transition-colors duration-200 hover: cursor-pointer"
                            onClick={handleLogout} // Use the client-side logout handler
                        >
                            <div className="flex items-center gap-2 ">
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}