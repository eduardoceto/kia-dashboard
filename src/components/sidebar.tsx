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



export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const manager = useUser().isManager
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
          ${isActive ? "text-white KiaSignatureBold"
          : "text-gray-300 hover:text-white "
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
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg  shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-40 w-64  transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          
          <div
            className="h-16 px-6 flex items-center ">
            <div className="flex items-center gap-3">
              <Image
                src={kiaLogo}
                alt="Kia Logo"
                width={100}
                height={100}
                className="flex-shrink-0 hover:cursor-pointer width:auto height:auto"
                onClick={handleIconClick}
              />
            </div>
          </div>
            
          

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="Formula1 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  General
                </div>
                <div className="KiaSignature space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  {manager && (
                    <NavItem href="/analytics" icon={BarChart2}>
                      Analytics
                    </NavItem>
                  )}
                </div>
              </div>

              <div>
                <div className="Formula1 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Files
                </div>
                <div className="KiaSignature space-y-1">
                  <NavItem href="/upload" icon={FaFileUpload}>
                    Upload Log
                  </NavItem>
                  <NavItem href="/history" icon={RiFolderHistoryFill}>
                    History
                  </NavItem>
                  {manager && (
                    <NavItem href="/export" icon={FaFileExport}>
                      Export Report
                    </NavItem>
                  )}
                  {manager && (
                    <NavItem href="/other" icon={BsThreeDotsVertical}>
                      Other
                    </NavItem>
                  )}
                </div>
              </div>
              

              <div>
                <div className="Formula1 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  User
                </div>
                <div className="KiaSignature space-y-1">
                  <NavItem href="/settings" icon={IoMdSettings}>
                    Settings
                  </NavItem>
                  {manager && (
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
          className="fixed inset-0  z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
