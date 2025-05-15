"use client"

import {
  BarChart2,
  Users2,
  Menu,
} from "lucide-react"
import { RiFolderHistoryFill } from "react-icons/ri";
import { FaFileExport } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaFileUpload } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

import { Home } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import kiaLogo from "@/public/kia-logo-white.svg"
import { usePathname, useRouter } from "next/navigation"
import { useLocale } from "next-intl"

import { useUser } from "@/src/hooks/useUser"
import LanguageSwitcher from "./languageSwitcher";
import { Bell } from "lucide-react";
import { FaCircleUser } from "react-icons/fa6";
import { PiUserCircleGearFill } from "react-icons/pi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import Profile01 from "./profile-01";
import formatUserName from "@/src/utils/formatUserName";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isManager, profile } = useUser();
  const router = useRouter()
  const locale = useLocale()
  

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleNavigation = () => {
    setIsMobileMenuOpen(false)
  }

  const handleIconClick = () => {
    const url = `/${locale}/dashboard`
    router.push(url)
  }

  const profileName = formatUserName(profile);
  const profileRole = profile?.role || "User";

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
  }) {
    const pathname = usePathname()
    const locale = useLocale()
    const isActive = pathname === `/${locale}${href}`

    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-3 py-2 text-sm transition-colors border-l-4
          ${isActive ? "text-white KiaSignatureBold border-[#3b4a5a] bg-[#232e3c]" :
          "text-gray-300 border-transparent hover:text-white hover:border-[#3b4a5a] hover:bg-[#1a2633]"}
        `}
        style={{ borderRadius: 0 }}
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
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        style={{
          background: "linear-gradient(to bottom, #05141F 80%, #1a2633 100%)",
          borderRight: "1px solid #232e3c"
        }}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="h-20 px-8 flex items-center border-b border-[#232e3c]">
              <div className="flex items-center gap-3">
                <Image
                  src={kiaLogo}
                  alt="Kia Logo"
                  width={120}
                  height={40}
                  className="flex-shrink-0 hover:cursor-pointer drop-shadow-lg"
                  onClick={handleIconClick}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <div className="space-y-8">
                <div>
                  <div className="Formula1 px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400/80">
                    General
                  </div>
                  <div className="KiaSignature space-y-1">
                    <NavItem href="/dashboard" icon={Home}>
                      Dashboard
                    </NavItem>
                    {isManager && (
                      <NavItem href="/analytics" icon={BarChart2}>
                        Analytics
                      </NavItem>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#232e3c] pt-6 mt-2">
                  <div className="Formula1 px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400/80">
                    Files
                  </div>
                  <div className="KiaSignature space-y-1">
                    <NavItem href="/upload" icon={FaFileUpload}>
                      Upload Log
                    </NavItem>
                    <NavItem href="/history" icon={RiFolderHistoryFill}>
                      History
                    </NavItem>
                    {isManager && (
                      <NavItem href="/export" icon={FaFileExport}>
                        Export Report
                      </NavItem>
                    )}
                    {isManager && (
                      <NavItem href="/other" icon={BsThreeDotsVertical}>
                        Other
                      </NavItem>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#232e3c] pt-6 mt-2">
                  <div className="Formula1 px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400/80">
                    User
                  </div>
                  <div className="KiaSignature space-y-1">
                    <NavItem href="/settings" icon={IoMdSettings}>
                      Settings
                    </NavItem>
                    {isManager && (
                      <NavItem href="/permissions" icon={Users2}>
                        User Permissions
                      </NavItem>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom-aligned controls */}
          <div className="flex flex-col gap-2 px-4 pb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div aria-label="Language Switcher" title="Language Switcher">
                <LanguageSwitcher />
              </div>
              <button
                type="button"
                className="p-2 text-gray-300 hover:bg-[#232e3c] hover:text-white rounded-full transition-colors"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" aria-label="Open profile menu" title="Open profile menu">
                  {isManager ? (
                    <PiUserCircleGearFill className="rounded-full ring-2 ring-white w-8 h-8 cursor-pointer text-white p-0.9" />
                  ) : (
                    <FaCircleUser className="rounded-full ring-2 ring-white w-8 h-8 cursor-pointer text-white p-0.9" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[240px] bg-[#1f2c35] border-foreground rounded-lg shadow-lg"
                >
                  <Profile01
                    name={profileName}
                    role={profileRole}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[65] lg:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
