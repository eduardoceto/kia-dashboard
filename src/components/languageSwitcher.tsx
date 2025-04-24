"use client"

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';

const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-3">
      <Link 
        href={pathname} 
        locale="en"
        className={`text-sm px-2 py-1 rounded ${locale === 'en' 
          ? 'dark:text-white text-gray-900' 
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}
      >
        En
      </Link>
      <div>
        /
      </div>
      <Link 
        href={pathname}
        locale="es"
        className={`text-sm px-2 py-1 rounded ${locale === 'es' 
          ? 'dark:text-white text-gray-900' 
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}
      >
        Es
      </Link>
    </div>
  )
}

export default LanguageSwitcher

