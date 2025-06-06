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
        <div className={`flex h-screen`}>
            <Sidebar />
            <div className="KiaSignature w-full flex flex-1 p-6 flex-col bg-background overflow-y-auto">
                    {children}
            </div>
        </div>
    )
}