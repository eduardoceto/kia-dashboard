"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Sidebar from "@/src/components/sidebar"
import TopNav from "@/src/components/top-nav"
import { useUser } from "../hooks/useUser"
import { LoaderCircle } from "lucide-react"

interface LayoutProps {
    children: ReactNode;
}

export default function HeaderSide({ children }: LayoutProps) { // Destructure userProfile
    const [mounted, setMounted] = useState(false)
    const { profile: userProfile, loading } = useUser()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null // Or a loading skeleton
    }
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white text-[#05141F]">
                
                <LoaderCircle className="h-12 w-12 animate-spin mb-4" />
                <p className="text-lg font-medium">Cargando...</p>
                <p className="text-sm text-muted-foreground">Por favor espera un momento.</p>
            </div>
        ) // Or a loading skeleton
    }

    return (
        <div className={`flex h-screen bg-[#05141F]`}>
            <Sidebar />
            <div className="KiaSignature w-full flex flex-1 flex-col">
                <TopNav userProfile={userProfile} />
                <main className="flex-1 overflow-auto p-6 bg-[#f2f2f2]">
                    {children}
                </main>
            </div>
        </div>
    )
}