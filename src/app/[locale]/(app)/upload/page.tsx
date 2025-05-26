import Link from "next/link"
import WasteDisposalForm from "@/src/app/[locale]/(app)/upload/components/waste-disposal-form"
import { Button } from "@/src/components/ui/button"
import { ClipboardList, FileSpreadsheet } from "lucide-react"
import { Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from "@/src/components/ui/accordion";
import { Card, CardContent } from "@/src/components/ui/card"
import DashboardHeader from "@/src/components/DashboardHeader";

export default function Upload() {
  return (
    <main className="container mx-auto py-10 px-4">
      <DashboardHeader
        variant="page"
        title="Registro de Residuos"
        actions={
          <>
            <Link href="/history">
              <Button variant="outline" className="flex items-center gap-2 bg-primary-foreground border">
                <ClipboardList className="h-4 w-4" />
                Ver Historial
              </Button>
            </Link>
            <Link href="/export">
              <Button variant="outline" className="flex items-center gap-2 bg-primary-foreground border">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar
              </Button>
            </Link>
          </>
        }
      />

      <Card className="w-full">
        <CardContent>
        <Accordion type="single" defaultValue="Registro de Salida de Residuos" collapsible>

          <AccordionItem value="Registro de Salida de Residuos">
            <AccordionTrigger>
                <div className="flex flex-col items-start text-left p-1">
                    <h3 className="text-lg font-medium hover:cursor-pointer">Registro de Salida de Residuos</h3>
                    <p className="text-sm text-muted-foreground ">Ingresar los residuos de salida</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="w-full">
              <WasteDisposalForm />
            </AccordionContent>
          </AccordionItem>

        </Accordion>
        </CardContent>
      </Card>
    </main>
  )
}
