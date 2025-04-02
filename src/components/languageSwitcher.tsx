"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"

const LanguageSwitcher = () => {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  
  // Extract the current language from the pathname
  const currentLang = pathname.split('/')[1] || 'en'
  
  // Get the path without the language prefix
  const basePath = pathname.split('/').slice(2).join('/')

  return (
    <div className="flex items-center space-x-3">
      <Link 
        href={`/en/${basePath}`}
        className={`text-sm px-2 py-1 rounded ${currentLang === 'en' 
          ? 'dark:text-white text-gray-900' 
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}
      >
        En
      </Link>
      <div>
        /
      </div>
      <Link 
        href={`/es/${basePath}`}
        className={`text-sm px-2 py-1 rounded ${currentLang === 'es' 
          ? 'dark:text-white text-gray-900' 
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}
      >
        Es
      </Link>
    </div>
  )
}

export default LanguageSwitcher

