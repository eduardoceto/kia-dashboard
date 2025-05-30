"use client"

import { Accordion } from "@/src/components/ui/accordion"
import { Card, CardContent } from "@/src/components/ui/card"
import { createClient } from "@/src/utils/supabase/client"
import EmployeeManagement from "@/src/app/[locale]/(app)/(manager)/permissions/components/EmployeeManagement" // Import new component
import DriverManagement from "@/src/app/[locale]/(app)/(manager)/permissions/components/DriverManagement" // Import new component
import { useTranslations } from "next-intl"; // Import useTranslations
import { useUser } from "@/src/hooks/useUser";
import { redirect } from "next/navigation";
import DashboardHeader from "@/src/components/DashboardHeader";

export default function AdminPage() {
  const supabase = createClient() // Create Supabase client instance here
  const t = useTranslations('permissionsPage'); // Initialize translations
  const isManager = useUser().isManager; 
  
  if (!isManager) {
    // Redirect or show an access denied message
    redirect('/'); // Replace '/access-denied' with your actual redirection ur
    return null;
  }

  // Removed all state and effect logic previously here

  // --- Render Logic ---

  return (
    <div className="container mx-auto py-8">
      <DashboardHeader variant="page" title={t('title')} />
      <Card>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="employees"> {/* Optionally set a default open item */}
            {/* --- Employee Management Section --- */}
            {/* Render the EmployeeManagement component, passing the supabase client */}
            <EmployeeManagement supabase={supabase} />

            {/* --- Driver Management Section --- */}
            {/* Render the DriverManagement component, passing the supabase client */}
            <DriverManagement supabase={supabase} />

            {/* Removed all the original JSX for Employee and Driver tables/dialogs */}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}