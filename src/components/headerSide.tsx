"use client"

import type { ReactNode } from "react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Sidebar from "@/src/components/sidebar"
import TopNav from "@/src/components/top-nav"
import { UserProfile } from "@/types"

interface LayoutProps {
    children: ReactNode;
    userProfile: UserProfile; // Add userProfile prop
}

export default function HeaderSide({ children, userProfile }: LayoutProps) { // Destructure userProfile
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null // Or a loading skeleton
    }

    return (
        <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
            <Sidebar />
            <div className="KiaSignature w-full flex flex-1 flex-col">
                <TopNav userProfile={userProfile} />
                <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">
                    {children}
                </main>
            </div>
        </div>
    )
}