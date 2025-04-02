"use client"

import type { ReactNode } from "react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Sidebar from "@/src/components/sidebar"
import TopNav  from "@/src/components/top-nav"
import Content from "@/src/components/content"

interface LayoutProps {
  children: ReactNode
}

export default function Home ({ children }: LayoutProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar />
      <div className="KiaSignature w-full flex flex-1 flex-col">
        <header className="Formula1 h-16 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">
          <Content />
        </main>
      </div>
    </div>
  )
}