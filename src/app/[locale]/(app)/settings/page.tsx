"use client"

import { useRouter, usePathname } from "next/navigation"
import { Languages } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { useUser } from "@/src/hooks/useUser"
import { useLocale } from "next-intl"
import { createClient } from "@/src/utils/supabase/client"
import DashboardHeader from "@/src/components/DashboardHeader"
import { useTranslations } from "next-intl"

export default function SettingsPage() {
  const t = useTranslations('settingsPage')
  const currentUser = useUser().profile
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const currentLocale = useLocale()


  const handleLanguageChange = (newLocale: string) => {
      const currentPath = pathname
      // Ensure currentUser is available before proceeding
      if (!currentUser?.id) {
        console.error("User ID not found");
        return;
      }
      const newPath = currentPath.replace(`/${currentLocale}/`, `/${newLocale}/`)
      supabase.from("users").update({ locale: newLocale }).eq("id", currentUser.id).then(({ error }) => {
        if (error) {
          console.error("Error updating locale:", error);
          // Handle error appropriately, maybe show a notification to the user
        } else {
          router.push(newPath)
        }
      })
    }

  return (
    <div className="container mx-auto py-8">
      <DashboardHeader variant="page" title={t('title')} />

      <div className="flex justify-center">
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileTitle')}</CardTitle>
              <CardDescription>{t('profileDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('nameLabel')}</p>
                  <p className="col-span-2 text-sm">{currentUser?.first_name} {currentUser?.last_name}</p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('emailLabel')}</p>
                  <p className="col-span-2 text-sm">{currentUser?.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('idLabel')}</p>
                  <p className="col-span-2 text-sm">{currentUser?.employee_id}</p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('roleLabel')}</p>
                  <p className="col-span-2 text-sm">{currentUser?.role}</p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('statusLabel')}</p>
                  <p className="col-span-2 text-sm">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${currentUser?.is_active ? "bg-green-500" : "bg-red-500"} mr-2`}
                    ></span>
                    {currentUser?.is_active ? t('active') : t('inactive')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('joinDateLabel')}</p>
                  {/* Format the date and time */}
                  <p className="col-span-2 text-sm">
                    {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleString() : t('notAvailable')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('languageTitle')}</CardTitle>
              <CardDescription>{t('languageDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue={currentLocale} 
                onValueChange={handleLanguageChange}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="english" />
                  <Label htmlFor="english" className="flex items-center gap-2 font-normal">
                    <Languages className="h-4 w-4" />
                    {t('english')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="es" id="spanish" />
                  <Label htmlFor="spanish" className="flex items-center gap-2 font-normal">
                    <Languages className="h-4 w-4" />
                    {t('spanish')}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
