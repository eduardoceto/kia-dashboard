"use client"

import { useState, useEffect } from "react"
import { Link } from '@/src/i18n/navigation';
import { format, isAfter, isBefore, isEqual } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Check, Download, FileSpreadsheet, Loader2 } from "lucide-react"
import ExcelJS from "exceljs"
import { useTranslations } from "next-intl"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

import { fetchWasteDisposalLogs } from "@/src/actions/submitWasteDisposal"
import {
  type LogEntry,
  formatTableDate,
  getResidueName,
  calculateTotalWeight,
  calculateTotalWeightByMaterial,
  getResidueItem,
  getResidueQuantity,
  getResidueUnit,
  getResidueRemision,
  getResidueManifestNo,
  getResidueTransport,
  getResidueArea,
  type MetalResiduo,
  type OtrosResiduo,
  type LodosResiduo,
  type DestruidasResiduo,
} from "@/src/utils/log/log-utils"
import { Driver } from "@/src/app/[locale]/(app)/upload/components/waste-disposal-form/DriverInfo"
import DashboardHeader from "@/src/components/DashboardHeader"

// Define a type for the DB log structure, e.g. type DbWasteLog = { ... } and use it instead of 'any'.
type DbWasteLog = {
  drivers?: Driver[] | Driver;
  excel_id?: number;
  waste_name?: string;
  [key: string]: unknown;
};

export default function ExportPage() {
  const t = useTranslations('exportPage');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectAllMaterials, setSelectAllMaterials] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Get all logs from the database
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State to control preview limit
  const [showAllPreview, setShowAllPreview] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      const result = await fetchWasteDisposalLogs()
      if (result.success) {
        // --- Mapping logic from history page ---
        const excelIdToTipoMaterial = {
          1: "lodos",
          2: "destruidas",
          3: "otros",
          4: "metal",
        };
        const mappedLogs = (result.data || []).map((log: DbWasteLog) => {
          // Use drivers field from explicit join
          const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers;
          const getDriverField = (field: keyof Driver): string => {
            if (!driver) return '';
            if (Array.isArray(driver)) return '';
            if (typeof driver === 'object' && driver !== null && field in driver) {
              const value = driver[field];
              return typeof value === 'string' ? value : '';
            }
            return '';
          };
          const tipoMaterial = excelIdToTipoMaterial[Number(log.excel_id) as 1|2|3|4] || "";
          let residuos = {};
          if (tipoMaterial === "lodos") {
            residuos = {
              nombreResiduo: log.waste_name,
              manifiestoNo: log["Manifiesto No."],
              area: log.area,
              transporteNoServicios: log.transport_num_services,
              pesoKg: log.quantity,
            };
          } else if (tipoMaterial === "metal") {
            residuos = {
              tipoResiduo: log.waste_type,
              item: log.waste_name,
              cantidad: log.quantity,
              unidad: log.quantity_type,
              remisionHMMX: log.REM ? log.REM.toString() : undefined,
            };
          } else if (tipoMaterial === "otros") {
            residuos = {
              tipoDesecho: log.waste_type,
              item: log.waste_name,
              cantidad: log.quantity,
              unidad: log.quantity_type,
              remisionHMMX: log.REM ? log.REM.toString() : undefined,
            };
          } else if (tipoMaterial === "destruidas") {
            residuos = {
              residuos: log.waste_name,
              area: log.area,
              peso: log.quantity,
            };
          }
          return {
            fecha: String(log.date || ''),
            horaSalida: String(log.departure_time || ''),
            folio: String(log.folio || ''),
            departamento: String(log.department || ''),
            motivo: String(log.reason || ''),
            nombreChofer: `${getDriverField('first_name')} ${getDriverField('last_name')}`.trim(),
            compania: getDriverField('company'),
            procedencia: getDriverField('origin'),
            destino: getDriverField('destination'),
            placas: getDriverField('vehicle_plates'),
            numeroEconomico: getDriverField('economic_number'),
            tipoMaterial,
            residuos,
            pesoTotal: log.quantity?.toString() || '',
            tipoContenedor: String(log.container_type || ''),
            personaAutoriza: String(log.authorizing_person || ''),
          };
        }).filter(log => isValidDate(log.fecha));
        setLogs(mappedLogs)
      } else {
        setError("Error al cargar los registros de la base de datos.")
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  // Helper to check for valid date
  const isValidDate = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

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

  const handleSelectAllMaterials = () => {
    setSelectAllMaterials(!selectAllMaterials)
    if (!selectAllMaterials) {
      setSelectedMaterials([])
    }
  }

  // State for additional filters
  const [selectedWasteType, setSelectedWasteType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<string>("all");

  // Reset additional filters when tab changes
  useEffect(() => {
    setSelectedWasteType("all");
    setSelectedItem("all");
  }, [activeTab]);

  // Get unique waste types and items
  const getWasteTypes = () => {
    const types = logs
      .filter((log) => log.tipoMaterial === activeTab)
      .map((log) => {
        switch (log.tipoMaterial) {
          case "metal":
            return (log.residuos as MetalResiduo).tipoResiduo;
          case "otros":
            return (log.residuos as OtrosResiduo).tipoDesecho;
          case "lodos":
            return (log.residuos as LodosResiduo).nombreResiduo;
          case "destruidas":
            return (log.residuos as DestruidasResiduo).residuos;
          default:
            return null;
        }
      })
      .filter((type): type is string => type !== null);
    return Array.from(new Set(types));
  };

  const getItems = () => {
    const items = logs
      .filter((log) => log.tipoMaterial === activeTab)
      .map((log) => {
        switch (log.tipoMaterial) {
          case "metal":
          case "otros":
            return (log.residuos as MetalResiduo | OtrosResiduo).item;
          case "lodos":
            return (log.residuos as LodosResiduo).area;
          case "destruidas":
            return (log.residuos as DestruidasResiduo).area;
          default:
            return null;
        }
      })
      .filter((item): item is string => item !== null);
    return Array.from(new Set(items));
  };

  // Filter logs based on all criteria
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.fecha);

    // Filter by date range if both dates are selected
    const dateInRange =
      !startDate ||
      !endDate ||
      ((isAfter(logDate, startDate) || isEqual(logDate, startDate)) &&
        (isBefore(logDate, endDate) || isEqual(logDate, endDate)));

    // Filter by material type if any are selected
    const materialMatches = selectAllMaterials || selectedMaterials.includes(log.tipoMaterial);

    // Filter by active tab
    const tabMatches = activeTab === "all" || log.tipoMaterial === activeTab;

    // Filter by waste type
    let wasteTypeMatches = true;
    if (activeTab !== "all" && selectedWasteType !== "all") {
      switch (log.tipoMaterial) {
        case "metal":
          wasteTypeMatches = (log.residuos as MetalResiduo).tipoResiduo === selectedWasteType;
          break;
        case "otros":
          wasteTypeMatches = (log.residuos as OtrosResiduo).tipoDesecho === selectedWasteType;
          break;
        case "lodos":
          wasteTypeMatches = (log.residuos as LodosResiduo).nombreResiduo === selectedWasteType;
          break;
        case "destruidas":
          wasteTypeMatches = (log.residuos as DestruidasResiduo).residuos === selectedWasteType;
          break;
      }
    }

    // Filter by item/area
    let itemMatches = true;
    if (activeTab !== "all" && selectedItem !== "all") {
      switch (log.tipoMaterial) {
        case "metal":
        case "otros":
          itemMatches = (log.residuos as MetalResiduo | OtrosResiduo).item === selectedItem;
          break;
        case "lodos":
        case "destruidas":
          itemMatches = (log.residuos as LodosResiduo | DestruidasResiduo).area === selectedItem;
          break;
      }
    }

    return dateInRange && materialMatches && tabMatches && wasteTypeMatches && itemMatches;
  });

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Export to Excel using exceljs and templates
  const exportToExcel = async () => {
    if (activeTab === "all") {
      setExportError("Please select a specific material type tab to export.")
      setTimeout(() => setExportError(null), 5000)
      return
    }

    setIsExporting(true)
    setExportSuccess(false)
    setExportError(null)

    try {
      let templatePath = ""
      switch (activeTab) {
        case "lodos":
          templatePath = "/TemplateLodos.xlsx"
          break
        case "metal":
          templatePath = "/TemplateMetal.xlsx"
          break
        case "otros":
          templatePath = "/TemplateOthers.xlsx"
          break
        case "destruidas": // Assuming this corresponds to Uretano/Vidrio/Autopartes
          templatePath = "/TemplateUretano.xlsx" // Note the typo in the actual filename
          break
        default:
          setExportError("Invalid material type selected.")
          setIsExporting(false)
          return
      }

      // Fetch the template file
      const response = await fetch(templatePath)
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`)
      }
      const templateBuffer = await response.arrayBuffer()

      // Load the workbook from the template
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(templateBuffer)

      // Assume data goes into the first worksheet
      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        throw new Error("Template worksheet not found.")
      }

      // --- Data Population Logic --- 
      let startRow = 0
      if (activeTab === "metal") {
        startRow = 5
      }
      else if (activeTab === "otros") {
        startRow = 5
      }
      else if (activeTab === "lodos") {
        startRow = 8
      }
      else if (activeTab === "destruidas") {
        startRow = 7
      }


      filteredLogs.forEach((log) => {
        

        if (activeTab === "metal") {
          worksheet.getCell(`B${startRow}`).value = formatTableDate(log.fecha)
          worksheet.getCell(`C${startRow}`).value = getResidueName(log)
          worksheet.getCell(`D${startRow}`).value = log.compania
          worksheet.getCell(`E${startRow}`).value = "Hyundai Materials México S. DE R.L DE C.V"
          worksheet.getCell(`F${startRow}`).value = getResidueItem(log)
          worksheet.getCell(`G${startRow}`).value = getResidueQuantity(log)
          worksheet.getCell(`H${startRow}`).value = getResidueUnit(log)
          worksheet.getCell(`I${startRow}`).value = getResidueRemision(log)
        }
        else if (activeTab === "otros") {
          worksheet.getCell(`B${startRow}`).value = formatTableDate(log.fecha)
          worksheet.getCell(`C${startRow}`).value = getResidueName(log)
          worksheet.getCell(`D${startRow}`).value = log.compania
          worksheet.getCell(`E${startRow}`).value = "Hyundai Materials México S. DE R.L DE C.V"
          worksheet.getCell(`F${startRow}`).value = getResidueItem(log)
          worksheet.getCell(`G${startRow}`).value = getResidueQuantity(log)
          worksheet.getCell(`H${startRow}`).value = getResidueUnit(log)
          worksheet.getCell(`I${startRow}`).value = getResidueRemision(log)
        }
        else if (activeTab === "lodos") {
          worksheet.getCell(`B${startRow}`).value = formatTableDate(log.fecha)
          worksheet.getCell(`C${startRow}`).value = getResidueName(log)
          worksheet.getCell(`D${startRow}`).value = log.compania
          worksheet.getCell(`E${startRow}`).value = log.destino
          worksheet.getCell(`F8`).value = getResidueItem(log)
          worksheet.getCell(`G8`).value = getResidueManifestNo(log)
          worksheet.getCell(`H8`).value = getResidueArea(log)
          worksheet.getCell(`I8`).value = getResidueTransport(log)
          worksheet.getCell(`J8`).value = getResidueQuantity(log)
        }
        else if (activeTab === "destruidas") {
          worksheet.getCell(`B${startRow}`).value = formatTableDate(log.fecha)
          worksheet.getCell(`C${startRow}`).value = "RME"
          worksheet.getCell(`D${startRow}`).value = log.compania
          worksheet.getCell(`E${startRow}`).value = log.destino
          worksheet.getCell(`F${startRow}`).value = getResidueItem(log)
          worksheet.getCell(`G${startRow}`).value = getResidueManifestNo(log)
          worksheet.getCell(`H${startRow}`).value = getResidueQuantity(log)
        }
        startRow++
      })
      // --- End Data Population Logic ---

      // Generate Excel file buffer
      const excelBuffer = await workbook.xlsx.writeBuffer()

      // Create Blob and download
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Generate filename
      const today = format(new Date(), "dd-MM-yyyy")
      let filename = `Registros_${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}_${today}`
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
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      setExportError(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-96">
          <span className="text-lg text-muted-foreground">Cargando registros...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-96">
          <span className="text-lg text-destructive">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <DashboardHeader
          variant="page"
          title={t('title')}
          actions={
            <Link href="/history">
              <Button variant="outline" className="flex items-center gap-2 bg-primary-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {t('historyButton')}
              </Button>
            </Link>
          }
        />

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full bg-popover">
            <TabsTrigger value="all">{t('filters.allMaterialsLabel')}</TabsTrigger>
            <TabsTrigger value="metal">{t('filters.metalTab')}</TabsTrigger>
            <TabsTrigger value="otros">{t('filters.otrosTab')}</TabsTrigger>
            <TabsTrigger value="lodos">{t('filters.lodosTab')}</TabsTrigger>
            <TabsTrigger value="destruidas">{t('filters.destruidasTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <p className="text-sm text-muted-foreground">{t('filtersDescription')}</p>
          </TabsContent>
          <TabsContent value="metal" className="mt-4">
            <p className="text-sm text-muted-foreground">{t('metalTabDescription')}</p>
          </TabsContent>
          <TabsContent value="otros" className="mt-4">
            <p className="text-sm text-muted-foreground">{t('otrosTabDescription')}</p>
          </TabsContent>
          <TabsContent value="lodos" className="mt-4">
            <p className="text-sm text-muted-foreground">{t('lodosTabDescription')}</p>
          </TabsContent>
          <TabsContent value="destruidas" className="mt-4">
            <p className="text-sm text-muted-foreground">{t('destruidasTabDescription')}</p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filter Card */}
          <Card className="md:col-span-1">
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
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="h-4 w-4 mr-2" />
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
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="h-4 w-4 mr-2" />
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

              {/* Material Types - Only show if "all" tab is selected */}
              {activeTab === "all" && (
                <div className="space-y-4">
                  <h3 className="font-medium">{t('materialTypesTitle')}</h3>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAllMaterials}
                        onCheckedChange={handleSelectAllMaterials}
                      />
                      <Label htmlFor="select-all">{t('selectAllMaterialsLabel')}</Label>
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

              {/* Additional Filters - Only show if a specific tab is selected */}
              {activeTab !== "all" && (
                <div className="space-y-4">
                  <h3 className="font-medium">{t('filtersTitle')}</h3>

                  <div className="space-y-4">
                    {/* Waste Type Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="waste-type">
                        {activeTab === "metal" && t('filters.metalWasteType')}
                        {activeTab === "otros" && t('filters.otrosWasteType')}
                        {activeTab === "lodos" && t('filters.lodosWasteType')}
                        {activeTab === "destruidas" && t('filters.destruidasWasteType')}
                      </Label>
                        <Select 
                        value={selectedWasteType} onValueChange={setSelectedWasteType}>
                        <SelectTrigger id="waste-type">
                          <SelectValue placeholder={t('filters.selectWasteTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('filters.allWasteTypes')}</SelectItem>
                          {getWasteTypes().map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                    </div>

                    {/* Item/Area Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="item">
                        {(activeTab === "metal" || activeTab === "otros") && t('filters.itemLabel')}
                        {(activeTab === "lodos" || activeTab === "destruidas") && t('filters.areaLabel')}
                      </Label>
                      <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger id="item">
                          <SelectValue placeholder={t('filters.selectItemPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('filters.allItems')}</SelectItem>
                          {getItems().map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Format Info */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium">{t('exportFormatTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? t('exportFormatAll')
                    : t(`exportFormatSpecific.${activeTab}`)}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={exportToExcel} disabled={isExporting || filteredLogs.length === 0}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('exportingButton')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('exportButton')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Preview Card */}
          <Card className="md:col-span-2">
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
                      <TableRow className="bg-muted/30 hover:bg-muted/40">
                        <TableHead className="w-[100px]">{t('previewTableHeaders.date')}</TableHead>
                        <TableHead>{t('previewTableHeaders.materialType')}</TableHead>
                        <TableHead>{t('previewTableHeaders.waste')}</TableHead>
                        <TableHead className="text-right">{t('previewTableHeaders.totalWeight')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(showAllPreview ? filteredLogs : filteredLogs.slice(0, 5)).map((log) => (
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
                              ? ((log.residuos as MetalResiduo | OtrosResiduo)?.unidad || "KG")
                              : "KG"}
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredLogs.length > 5 && !showAllPreview && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-2">
                            <button
                              className="text-primary underline hover:no-underline"
                              onClick={() => setShowAllPreview(true)}
                            >
                              {t('moreItemsBadge', { count: filteredLogs.length - 5 })}
                            </button>
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredLogs.length > 5 && showAllPreview && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-2">
                            <button
                              className="text-primary underline hover:no-underline"
                              onClick={() => setShowAllPreview(false)}
                            >
                              {t('hideExtraRecords')}
                            </button>
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
              <CardFooter className="flex flex-col items-stretch">
                <div className="w-full border-t border-muted pt-4 mt-2">
                  <h3 className="font-medium mb-2">{t('summaryTitle')}</h3>
                  <div className="space-y-2">
                    {Object.entries(calculateTotalWeightByMaterial(filteredLogs)).map(([material, weight]) => (
                      <div key={material} className="flex justify-between">
                        <span className="capitalize">{material}</span>
                        <span className="font-medium">{weight.toFixed(2)} kg</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-muted">
                      <span className="font-bold">{t('totalLabel')}</span>
                      <span className="font-bold">{calculateTotalWeight(filteredLogs)} kg</span>
                    </div>
                  </div>
                </div>

                {exportSuccess && (
                  <div className="flex items-center gap-2 text-green-500 mt-4 self-end">
                    <Check className="h-4 w-4" />
                    <span>{t('exportSuccessMessage')}</span>
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
