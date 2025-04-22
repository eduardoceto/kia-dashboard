import Link from "next/link"
import WasteDisposalForm from "@/src/components/waste-disposal-form"
import { Button } from "@/src/components/ui/button"
import { ClipboardList } from "lucide-react"
import { FileSpreadsheet } from "lucide-react"

export default function Upload() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Registro de Salida de Residuos</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/history">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-background/10 border-muted hover:bg-muted/20"
            >
              <ClipboardList className="h-4 w-4" />
              Ver Historial
            </Button>
          </Link>
          <Link href="/export">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-background/10 border-muted hover:bg-muted/20"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
          </Link>
        </div>
      </div>
      <WasteDisposalForm />
    </main>
  )
}
