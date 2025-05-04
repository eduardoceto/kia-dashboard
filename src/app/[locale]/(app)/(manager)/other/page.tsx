"use client";
import { Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger } from "@/src/components/ui/accordion";
import { Card, CardContent } from "@/src/components/ui/card"
import VehicleProductionForm  from "./components/VehicleProductionForm";
import PanelProductionForm from "./components/PanelProductionForm";
import { useTranslations } from "next-intl"; // Import useTranslations
import { useUser } from "@/src/hooks/useUser";
import { redirect } from "next/navigation";

export default function Other() {
    const t = useTranslations('otherPage'); // Initialize translations
    const isManager = useUser().isManager; 
  
    if (!isManager) {
        // Redirect or show an access denied message
        redirect('/'); // Replace '/access-denied' with your actual redirection ur
        return null;
    }

    return (
        <main className="mx-auto py-10 px-4">
            <div className=" items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold p-3">{t('title')}</h1>
                <Card className="w-full">
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="Vehicle Production">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex flex-col items-start text-left">
                                        <h3 className="text-lg font-medium hover:underline hover:cursor-pointer">{t('vehicleProductionTitle')}</h3>
                                        <p className="text-sm text-muted-foreground">{t('vehicleProductionDescription')}</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <VehicleProductionForm />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="Panel Production">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex flex-col items-start text-left">
                                        <h3 className="text-lg font-medium hover:underline hover:cursor-pointer">{t('panelProductionTitle')}</h3>
                                        <p className="text-sm text-muted-foreground">{t('panelProductionDescription')}</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <PanelProductionForm/>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}