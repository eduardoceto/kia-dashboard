// filepath: /Users/eduardo/Library/CloudStorage/OneDrive-Personal/Programacion/Clases/DesarrolloWeb/Dashboard/kia-dashboard/src/components/profile-01.tsx
"use client" // Add "use client" directive

import { LogOut, MoveUpRight, Settings } from "lucide-react"
import Link from "next/link"
import { createClient } from "../utils/supabase/client" // Use client Supabase client
import { useRouter } from 'next/navigation' // Import useRouter for redirection
import { FaCircleUser } from "react-icons/fa6"
import { PiUserCircleGearFill } from "react-icons/pi";
import { toast } from "sonner"
import { useUser } from "../hooks/useUser";

interface MenuItem {
    label: string
    value?: string
    href: string
    icon?: React.ReactNode
    external?: boolean
}

interface Profile01Props {
    name: string 
    role: string
}


export default function Profile01({ name, role }: Profile01Props) { 
    const router = useRouter(); 
    const supabase = createClient(); 
    const manager = useUser().isManager; // Use the custom hook to get manager data



    const menuItems: MenuItem[] = [
        {
            label: "Settings",
            href: "/settings", 
            icon: <Settings className="w-4 h-4" />,
        },

    ]
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            // Optionally show an error message to the user
        } else {
            console.log("User signed out successfully");
            toast.success("Logout successful");
            // Redirect to login page after logout
            router.push('/login'); // Adjust path if needed (locale might be handled by middleware)
            router.refresh(); // Refresh server components
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto border-color-primary">
            <div className="relative overflow-hidden rounded-2xl border border-color-primary">
                <div className="relative px-6 pt-12 pb-6">
                    <div className="flex items-center gap-4 mb-8">
                    <div className="relative shrink-0">
                                {manager ? (
                                    <PiUserCircleGearFill
                                        className="rounded-full w-16 h-16 border-2 border-white  text-white " // Adjust size/styling as needed
                                    />
                                ) : (
                                    <FaCircleUser
                                        className="rounded-full w-16 h-16 border-2 border-white  text-white" // Adjust size/styling as needed
                                    />
                                )}
                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <h2 className="text-sm font-semibold text-white">{name}</h2>
                            <p className="text-zinc-400">{role}</p>
                        </div>
                    </div>
                    <div className="h-px my-6" />
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-between p-2 text-white
                                            hover:bg-white hover:text-[#1f2c35]
                                            rounded-lg transition-colors duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center">
                                    {item.value && <span className="text-sm mr-2">{item.value}</span>}
                                    {item.external && <MoveUpRight className="w-4 h-4" />}
                                </div>
                            </Link>
                        ))}

                        <button
                            type="button"
                            className="w-full flex items-center justify-between p-2 text-white
                                        hover:bg-white hover:text-[#1f2c35]
                                        rounded-lg transition-colors duration-200 hover: cursor-pointer"
                            onClick={handleLogout} // Use the client-side logout handler
                        >
                            <div className="flex items-center gap-2 ">
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}