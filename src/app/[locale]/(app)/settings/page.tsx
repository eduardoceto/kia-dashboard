"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ArrowLeft, Moon, Sun } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { useUser } from "@/src/hooks/useUser"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const currentUser = useUser().profile

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
            <CardTitle>Theme Preferences</CardTitle>
            <CardDescription>Customize your interface theme</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue={theme} onValueChange={(value) => setTheme(value)} className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 font-normal">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 font-normal">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="font-normal">
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
