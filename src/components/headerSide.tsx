"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Sidebar from "@/src/components/sidebar"

interface LayoutProps {
    children: ReactNode;
}

export default function HeaderSide({ children }: LayoutProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null // Or a loading skeleton
    }


    return (
        <div className={`flex h-screen bg-[#05141F]`}>
            <Sidebar />
            <div className="KiaSignature w-full flex flex-1 flex-col">
                <main className="flex-1 overflow-auto p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}