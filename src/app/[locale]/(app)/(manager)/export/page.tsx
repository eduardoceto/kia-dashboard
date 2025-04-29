"use client"

import { useState } from "react"
import Link from "next/link"
import { format, isAfter, isBefore, isEqual } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Calendar, Check, FileSpreadsheet, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import { useTranslations } from "next-intl"; // Import useTranslations

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Calendar as CalendarComponent } from "@/src/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"
import { getHistoricalLogs } from "@/src/components/testData/data"

export default function ExportPage() {
  const t = useTranslations('exportPage'); // Initialize translations
  const tCommon = useTranslations('common'); // Initialize common translations

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectAllMaterials, setSelectAllMaterials] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Get all logs
  const logs = getHistoricalLogs()

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

    return dateInRange && materialMatches
  })

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Calculate total weight by material type
  const calculateTotalWeightByMaterial = () => {
    const totals: Record<string, number> = {}

    filteredLogs.forEach((log) => {
      const materialType = log.tipoMaterial
      const weight = Number.parseFloat(log.pesoTotal)

      if (!totals[materialType]) {
        totals[materialType] = 0
      }

      totals[materialType] += weight
    })

    return totals
  }

  // Calculate total weight
  const calculateTotalWeight = () => {
    return filteredLogs.reduce((total, log) => total + Number.parseFloat(log.pesoTotal), 0).toFixed(2)
  }

  // Export to Excel
  const exportToExcel = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      // Prepare data for export with translated headers
      const exportData = filteredLogs.map((log) => ({
        [t('previewTableHeaders.date')]: format(new Date(log.fecha), "dd/MM/yyyy"),
        [t('wasteDisposalForm.folioLabel')]: log.folio, // Reuse existing key
        [t('wasteDisposalForm.timeLabel')]: log.horaSalida, // Reuse existing key
        [t('wasteDisposalForm.departmentLabel')]: log.departamento, // Reuse existing key
        [t('wasteDisposalForm.reasonLabel')]: log.motivo, // Reuse existing key
        [t('wasteDisposalForm.driverNameLabel')]: log.nombreChofer, // Reuse existing key
        [t('wasteDisposalForm.companyLabel')]: log.compania, // Reuse existing key
        [t('wasteDisposalForm.originLabel')]: log.procedencia, // Reuse existing key
        [t('wasteDisposalForm.destinationLabel')]: log.destino, // Reuse existing key
        [t('wasteDisposalForm.platesLabel')]: log.placas, // Reuse existing key
        [t('wasteDisposalForm.economicNumberLabel')]: log.numeroEconomico, // Reuse existing key
        [t('previewTableHeaders.materialType')]: log.tipoMaterial,
        [t('previewTableHeaders.waste')]: log.residuos.map((r: any) => `${r.nombreResiduo} (${r.peso} ${tCommon('kg')})`).join(", "),
        [`${t('previewTableHeaders.totalWeight')}`]: log.pesoTotal, // Template literal for key name
        [t('wasteDisposalForm.containerTypeLabel')]: log.tipoContenedor, // Reuse existing key
        [t('wasteDisposalForm.authorizingPersonLabel')]: log.personaAutoriza, // Reuse existing key
      }))

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros")

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

      // Generate filename with current date
      const today = format(new Date(), "dd-MM-yyyy")
      link.download = `Registros_Residuos_${today}.xlsx`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
    } finally {
      setIsExporting(false)

      // Reset success message after 3 seconds
      if (exportSuccess) {
        setTimeout(() => setExportSuccess(false), 3000)
      }
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backButton')}
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/history">
              <Button variant="outline" className="bg-background/10 border-muted">
                {t('historyButton')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filter Card */}
          <Card className="bg-background/5 border-muted md:col-span-1">
            <CardHeader>
              <CardTitle>{t('filtersTitle')}</CardTitle>
              <CardDescription>{t('filtersDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('dateRangeTitle')}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">{t('startDateLabel')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-background/5 border-muted"
                        >
                          <Calendar className="h-4 w-4 mr-2" /> {/* Added margin */}
                          {startDate ? formatDate(startDate) : t('selectDatePlaceholder')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">{t('endDateLabel')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-background/5 border-muted"
                        >
                          <Calendar className="h-4 w-4 mr-2" /> {/* Added margin */}
                          {endDate ? formatDate(endDate) : t('selectDatePlaceholder')}
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

              {/* Material Types */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('materialTypesTitle')}</h3>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="select-all" checked={selectAllMaterials} onCheckedChange={handleSelectAllMaterials} />
                    <Label htmlFor="select-all" className="KiaSignature">
                      {t('selectAllMaterialsLabel')}
                    </Label>
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
                          {/* Assuming material names themselves don't need translation, or use a mapping if they do */}
                          <Label htmlFor={`material-${material}`}>{material}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={exportToExcel} disabled={isExporting || filteredLogs.length === 0} className="w-full">
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('exportingButton')}
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {t('exportButton')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Preview Card */}
          <Card className="bg-background/5 border-muted md:col-span-2">
            <CardHeader>
              <CardTitle>{t('previewTitle')}</CardTitle>
              <CardDescription>
                {t('recordsFound', { count: filteredLogs.length })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/10">
                        <TableHead className="w-[100px]">{t('previewTableHeaders.date')}</TableHead>
                        <TableHead>{t('previewTableHeaders.materialType')}</TableHead>
                        <TableHead>{t('previewTableHeaders.waste')}</TableHead>
                        <TableHead className="text-right">{t('previewTableHeaders.totalWeight')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 5).map((log) => (
                        <TableRow key={log.folio} className="hover:bg-muted/10">
                          <TableCell>{formatDate(new Date(log.fecha))}</TableCell>
                          <TableCell>{log.tipoMaterial}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {log.residuos.slice(0, 2).map((residuo: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-background/10 text-foreground border-muted"
                                >
                                  {residuo.nombreResiduo}
                                </Badge>
                              ))}
                              {log.residuos.length > 2 && (
                                <Badge variant="outline" className="bg-background/10 text-foreground border-muted">
                                  {t('moreItemsBadge', { count: log.residuos.length - 2 })}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{log.pesoTotal}</TableCell>
                        </TableRow>
                      ))}

                      {filteredLogs.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-2 text-muted-foreground">
                            {t('moreRecordsIndicator', { count: filteredLogs.length - 5 })}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {t('noRecordsFound')}
                </div>
              )}
            </CardContent>

            {filteredLogs.length > 0 && (
              <CardFooter className="flex flex-col items-stretch"> {/* Changed to items-stretch */}
                <div className="w-full border-t border-muted pt-4 mt-2">
                  <h3 className="font-medium mb-2">{t('summaryTitle')}</h3>
                  <div className="space-y-2">
                    {Object.entries(calculateTotalWeightByMaterial()).map(([material, weight]) => (
                      <div key={material} className="flex justify-between">
                        {/* Assuming material names don't need translation */}
                        <span>{material}</span>
                        <span className="font-medium">{weight.toFixed(2)} {tCommon('kg')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-muted">
                      <span className="font-bold">{t('totalLabel')}</span>
                      <span className="font-bold">{calculateTotalWeight()} {tCommon('kg')}</span>
                    </div>
                  </div>
                </div>

                {exportSuccess && (
                  <div className="flex items-center gap-2 text-green-500 mt-4 self-end">
                    <Check className="h-4 w-4" />
                    <span>{t('exportSuccessMessage')}</span>
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
