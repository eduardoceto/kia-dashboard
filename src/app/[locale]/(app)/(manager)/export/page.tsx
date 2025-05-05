"use client"

import { useState } from "react"
import Link from "next/link"
import { format, isAfter, isBefore, isEqual } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Calendar, Check, Download, FileSpreadsheet, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Calendar as CalendarComponent } from "@/src/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { getHistoricalLogs } from "@/src/components/testData/dataLogs"
import {
  type LogEntry,
  formatTableDate,
  getResidueName,
  calculateTotalWeight,
  calculateTotalWeightByMaterial,
  exportLogsToExcel,
} from "@/src/utils/log/log-utils"

export default function ExportPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectAllMaterials, setSelectAllMaterials] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Get all logs
  const logs: LogEntry[] = getHistoricalLogs()

  // Get unique material types
  const materialTypes = Array.from(new Set(logs.map((log) => log.tipoMaterial)))

  // Handle material selection
  const handleMaterialChange = (material: string) => {
    setSelectAllMaterials(false)

    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== material))
    } else {
      setSelectedMaterials([...selectedMaterials, material])
    }
  }

  // Handle select all materials
  const handleSelectAllMaterials = () => {
    setSelectAllMaterials(!selectAllMaterials)
    if (!selectAllMaterials) {
      setSelectedMaterials([])
    }
  }

  // Filter logs based on selected date range and materials
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.fecha)

    // Filter by date range if both dates are selected
    const dateInRange =
      !startDate ||
      !endDate ||
      ((isAfter(logDate, startDate) || isEqual(logDate, startDate)) &&
        (isBefore(logDate, endDate) || isEqual(logDate, endDate)))

    // Filter by material type if any are selected
    const materialMatches = selectAllMaterials || selectedMaterials.includes(log.tipoMaterial)

    // Filter by active tab
    const tabMatches = activeTab === "all" || log.tipoMaterial === activeTab

    return dateInRange && materialMatches && tabMatches
  })

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Export to Excel
  const exportToExcel = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    setExportError(null)

    try {
      // Get workbook with formatted data based on material types
      const workbook = exportLogsToExcel(filteredLogs, activeTab !== "all" ? activeTab : undefined)

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Create Blob and download
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Generate filename with current date and date range if applicable
      const today = format(new Date(), "dd-MM-yyyy")
      let filename = `Registros_Residuos_${today}`

      // Add material type to filename if specific type is selected
      if (activeTab !== "all") {
        filename = `${filename}_${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
      }

      // Add date range to filename if available
      if (startDate && endDate) {
        const startDateStr = format(startDate, "dd-MM-yyyy")
        const endDateStr = format(endDate, "dd-MM-yyyy")
        filename = `${filename}_${startDateStr}_a_${endDateStr}`
      }

      link.download = `${filename}.xlsx`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      setExportError("Ocurrió un error al exportar los datos. Por favor, inténtelo de nuevo.")

      // Reset error message after 5 seconds
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Exportar Registros</h1>
            <p className="text-muted-foreground">Filtra y exporta los registros de residuos a Excel</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/history">
              <Button variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Ver Historial
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="metal">Metal/No Metal</TabsTrigger>
            <TabsTrigger value="otros">Otros Reciclables</TabsTrigger>
            <TabsTrigger value="lodos">Lodos</TabsTrigger>
            <TabsTrigger value="destruidas">Uretano/Vidrio/Autopartes</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando todos los tipos de residuos. Cada tipo se exportará en su formato específico.
            </p>
          </TabsContent>
          <TabsContent value="metal" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Formato de exportación para chatarra, incluye columnas para tipo de residuo, empresa transportista,
              empresa compradora, item, cantidad, unidad y remisión.
            </p>
          </TabsContent>
          <TabsContent value="otros" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Formato de exportación para reciclables (cartón, plástico, madera), incluye columnas específicas para
              estos materiales.
            </p>
          </TabsContent>
          <TabsContent value="lodos" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Formato de exportación para lodos y residuos de manejo especial, incluye columnas para manifiestos y áreas
              específicas.
            </p>
          </TabsContent>
          <TabsContent value="destruidas" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Formato de exportación para sellos de uretano y materiales destruidos, con formato específico para este
              tipo de residuo.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filter Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Define los parámetros para la exportación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="space-y-4">
                <h3 className="font-medium">Rango de Fechas</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Fecha Inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="h-4 w-4 mr-2" />
                          {startDate ? formatDate(startDate) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">Fecha Fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="h-4 w-4 mr-2" />
                          {endDate ? formatDate(endDate) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => (startDate ? isBefore(date, startDate) : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Material Types - Only show if "all" tab is selected */}
              {activeTab === "all" && (
                <div className="space-y-4">
                  <h3 className="font-medium">Tipos de Material</h3>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAllMaterials}
                        onCheckedChange={handleSelectAllMaterials}
                      />
                      <Label htmlFor="select-all">Todos los Materiales</Label>
                    </div>

                    {!selectAllMaterials && (
                      <div className="space-y-2 mt-2 pl-6">
                        {materialTypes.map((material) => (
                          <div key={material} className="flex items-center space-x-2">
                            <Checkbox
                              id={`material-${material}`}
                              checked={selectedMaterials.includes(material)}
                              onCheckedChange={() => handleMaterialChange(material)}
                            />
                            <Label htmlFor={`material-${material}`} className="capitalize">
                              {material}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Export Format Info */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium">Formato de Exportación</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "Se crearán hojas separadas para cada tipo de material con su formato específico."
                    : `Se exportará en el formato específico para ${
                        activeTab === "metal"
                          ? "chatarra"
                          : activeTab === "otros"
                            ? "reciclables"
                            : activeTab === "lodos"
                              ? "lodos"
                              : "sellos"
                      }`}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={exportToExcel} disabled={isExporting || filteredLogs.length === 0}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a Excel
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Preview Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                {filteredLogs.length} {filteredLogs.length === 1 ? "registro encontrado" : "registros encontrados"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/40">
                        <TableHead className="w-[100px]">Fecha</TableHead>
                        <TableHead>Tipo Material</TableHead>
                        <TableHead>Residuo/Desecho</TableHead>
                        <TableHead className="text-right">Peso Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 5).map((log) => (
                        <TableRow key={log.folio} className="hover:bg-muted/10">
                          <TableCell>{formatTableDate(log.fecha)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.tipoMaterial}
                            </Badge>
                          </TableCell>
                          <TableCell>{getResidueName(log)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {log.pesoTotal}{" "}
                            {log.tipoMaterial === "otros" || log.tipoMaterial === "metal"
                              ? (log.residuos as any)?.unidad || "KG"
                              : "KG"}
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredLogs.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-2 text-muted-foreground">
                            {filteredLogs.length - 5} registros más no mostrados en la vista previa
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No se encontraron registros con los filtros seleccionados
                </div>
              )}
            </CardContent>

            {filteredLogs.length > 0 && (
              <CardFooter className="flex flex-col items-stretch">
                <div className="w-full border-t border-muted pt-4 mt-2">
                  <h3 className="font-medium mb-2">Resumen</h3>
                  <div className="space-y-2">
                    {Object.entries(calculateTotalWeightByMaterial(filteredLogs)).map(([material, weight]) => (
                      <div key={material} className="flex justify-between">
                        <span className="capitalize">{material}</span>
                        <span className="font-medium">{weight.toFixed(2)} kg</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-muted">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">{calculateTotalWeight(filteredLogs)} kg</span>
                    </div>
                  </div>
                </div>

                {exportSuccess && (
                  <div className="flex items-center gap-2 text-green-500 mt-4 self-end">
                    <Check className="h-4 w-4" />
                    <span>Exportación exitosa</span>
                  </div>
                )}

                {exportError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{exportError}</AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
