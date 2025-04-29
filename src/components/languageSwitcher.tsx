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
          ? ' text-white' 
          : 'text-gray-300  hover:text-white'}`}
      >
        En
      </Link>
      <div className='text-white'>
        /
      </div>
      <Link 
        href={pathname}
        locale="es"
        className={`text-sm px-2 py-1 rounded ${locale === 'es' 
          ? 'text-white' 
          : 'text-gray-300  hover:text-white'}`}
      >
        Es
      </Link>
    </div>
  )
}

export default LanguageSwitcher

