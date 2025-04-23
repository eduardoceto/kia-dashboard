import { Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger } from "@/src/components/ui/accordion";
import { Card, CardContent } from "@/src/components/ui/card"
import VehicleProductionForm  from "./components/VehicleProductionForm";
import PanelProductionForm from "./components/PanelProductionForm";

export default function Other() {

    return (
        <main className="mx-auto py-10 px-4">
            <div className=" items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold p-3">Other</h1>
                <Card className="w-full">
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="Vehicle Production">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex flex-col items-start text-left">
                                        <h3 className="text-lg font-medium hover:underline hover:cursor-pointer">Monthly Vehicle Production</h3>
                                        <p className="text-sm text-muted-foreground">Enter production details for the month</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <VehicleProductionForm />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="Panel Production">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex flex-col items-start text-left">
                                        <h3 className="text-lg font-medium hover:underline hover:cursor-pointer">Monthly Panel Production</h3>
                                        <p className="text-sm text-muted-foreground">Enter production details for the month</p>
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