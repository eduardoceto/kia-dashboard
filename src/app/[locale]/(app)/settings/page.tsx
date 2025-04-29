"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowLeft, Moon, Sun, Languages } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { useUser } from "@/src/hooks/useUser"
import { useLocale } from "next-intl"
import { createClient } from "@/src/utils/supabase/client"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
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
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">User Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-1">
                <p className="text-sm font-medium text-muted-foreground">Name:</p>
                <p className="col-span-2 text-sm">{currentUser.full_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <p className="text-sm font-medium text-muted-foreground">Email:</p>
                <p className="col-span-2 text-sm">{currentUser.email}</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <p className="text-sm font-medium text-muted-foreground">ID Number:</p>
                <p className="col-span-2 text-sm">{currentUser.employee_id}</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <p className="text-sm font-medium text-muted-foreground">Role:</p>
                <p className="col-span-2 text-sm">{currentUser.role}</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <p className="text-sm font-medium text-muted-foreground">Status:</p>
                <p className="col-span-2 text-sm">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${currentUser.is_active ? "bg-green-500" : "bg-red-500"} mr-2`}
                  ></span>
                  {currentUser.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <p className="text-sm font-medium text-muted-foreground">Join Date:</p>
                {/* Format the date and time */}
                <p className="col-span-2 text-sm">
                  {currentUser.created_at ? new Date(currentUser.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Settings</CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
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
                  English
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="es" id="spanish" />
                <Label htmlFor="spanish" className="flex items-center gap-2 font-normal">
                  <Languages className="h-4 w-4" />
                  Español
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
