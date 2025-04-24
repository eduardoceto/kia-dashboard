"use client"

import {
  BarChart2,
  Receipt,
  Building2,
  CreditCard,
  Folder,
  Wallet,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
  Menu,
} from "lucide-react"
import { RiFolderHistoryFill } from "react-icons/ri";
import { FaFileExport } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaFileUpload } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

import { Home } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import Image from "next/image"
import kiaLogo from "@/public/kia-logo-white.svg"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { useLocale } from "next-intl"

import { useManager } from "../hooks/useManager"



export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const manager = useManager()
  const router = useRouter()
  const locale = useLocale()
  

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  const handleIconClick = () => {
    const url = `/${locale}/dashboard`
    router.push(url)
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    const pathname = usePathname()
    const locale = useLocale()
    const isActive = pathname === `/${locale}${href}`

    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors 
          ${isActive ? "text-dark dark:text-white bg-gray-300/50 dark:bg-[#1F1F23]/50"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50"
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          
          <div
            className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center gap-3">
              <Image
                src={kiaLogo}
                alt="Kia Logo"
                width={100}
                height={100}
                className="flex-shrink-0 hover:cursor-pointer hidden dark:block width:auto height:auto"
                onClick={handleIconClick}
              />
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/b/b6/KIA_logo3.svg"
                alt="Kia Logo"
                width={100}
                height={100}
                className="flex-shrink-0 hover:cursor-pointer block dark:hidden width:auto height:auto"
                onClick={handleIconClick}
              />
            </div>
          </div>
            
          

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="Formula1 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  General
                </div>
                <div className="KiaSignature space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  {manager.isManager && (
                    <NavItem href="/analytics" icon={BarChart2}>
                      Analytics
                    </NavItem>
                  )}
                </div>
              </div>

              <div>
                <div className="Formula1 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Files
                </div>
                <div className="KiaSignature space-y-1">
                  <NavItem href="/upload" icon={FaFileUpload}>
                    Upload Log
                  </NavItem>
                  <NavItem href="/history" icon={RiFolderHistoryFill}>
                    History
                  </NavItem>
                  {manager.isManager && (
                    <NavItem href="/export" icon={FaFileExport}>
                      Export Report
                    </NavItem>
                  )}
                  {manager.isManager && (
                    <NavItem href="/other" icon={BsThreeDotsVertical}>
                      Other
                    </NavItem>
                  )}
                </div>
              </div>
              

              <div>
                <div className="Formula1 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </div>
                <div className="KiaSignature space-y-1">
                  <NavItem href="/settings" icon={IoMdSettings}>
                    Settings
                  </NavItem>
                  {manager.isManager && (
                    <NavItem href="/permissions" icon={Users2}>
                      User Permissions
                    </NavItem>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
