"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, isAfter, isBefore, isEqual } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Download, FileSpreadsheet, Filter, Info, Search, Pencil } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Calendar as CalendarComponent } from "@/src/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"
import { cn } from "@/lib/utils"
import { fetchWasteDisposalLogs } from "@/src/actions/submitWasteDisposal"
import {
  type LogEntry,
  type LodosResiduo,
  type MetalResiduo,
  type OtrosResiduo,
  type DestruidasResiduo,
  formatDate,
  formatShortDate
} from "@/src/utils/log/log-utils"
import { generatePdf } from "@/src/actions/generatePdf"

// Define a type for the DB log structure, e.g. type DbWasteLog = { ... } and use it instead of 'any'.
type DbWasteLog = {
  drivers?: any;
  excel_id?: number;
  waste_name?: string;
  [key: string]: any;
};

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof LogEntry | "fecha">("fecha")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [materialFilter, setMaterialFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editLog, setEditLog] = useState<LogEntry | null>(null)

  // Items per page
  const itemsPerPage = 10

  // Fetch logs from Supabase on mount
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      const result = await fetchWasteDisposalLogs()
      if (result.success) {
        const excelIdToTipoMaterial = {
          1: "lodos",
          2: "destruidas",
          3: "otros",
          4: "metal",
        };

        const mappedLogs = (result.data || []).map((log: DbWasteLog) => {
          console.log("LOG ENTRY:", log);
          // Use drivers field from explicit join
          const driver = Array.isArray(log.drivers) ? log.drivers[0] : log.drivers;
          const getDriverField = (field: string) => driver && typeof driver === 'object' ? driver[field] || '' : '';

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
            fecha: log.date || '',
            horaSalida: log.departure_time || '',
            folio: log.folio || '',
            departamento: log.department || '',
            motivo: log.reason || '',
            nombreChofer: `${getDriverField('first_name')} ${getDriverField('last_name')}`.trim(),
            compania: getDriverField('company'),
            procedencia: getDriverField('origin'),
            destino: getDriverField('destination'),
            placas: getDriverField('vehicle_plates'),
            numeroEconomico: getDriverField('economic_number'),
            tipoMaterial,
            residuos,
            pesoTotal: log.quantity?.toString() || '',
            tipoContenedor: log.container_type || '',
            personaAutoriza: log.authorizing_person || '',
          };
        }).filter(log => !!log.fecha);
        setLogs(mappedLogs)
      } else {
        setError("Error al cargar los registros de la base de datos.")
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  // Helper function to apply material and date filters
  const applyMaterialAndDateFilters = (log: LogEntry) => {
    // Filter by material type
    const matchesMaterial = materialFilter === "all" ? true : log.tipoMaterial === materialFilter

    // Filter by date range
    const logDate = new Date(log.fecha)
    const matchesDateRange =
      !startDate ||
      !endDate ||
      ((isAfter(logDate, startDate) || isEqual(logDate, startDate)) &&
        (isBefore(logDate, endDate) || isEqual(logDate, endDate)))

    return matchesMaterial && matchesDateRange
  }

  // Filter logs based on search term, material filter, and date range
  const filteredLogs = logs.filter((log) => {
    const searchTermLower = searchTerm.toLowerCase().trim()

    // Skip search filtering if search term is empty
    if (!searchTermLower) {
      // Only apply material and date filters
      return applyMaterialAndDateFilters(log)
    }

    // Search in common fields
    const matchesCommonFields =
      log.folio.toLowerCase().includes(searchTermLower) ||
      log.tipoMaterial.toLowerCase().includes(searchTermLower) ||
      log.personaAutoriza.toLowerCase().includes(searchTermLower) ||
      log.departamento.toLowerCase().includes(searchTermLower) ||
      log.compania.toLowerCase().includes(searchTermLower) ||
      log.destino.toLowerCase().includes(searchTermLower) ||
      log.procedencia.toLowerCase().includes(searchTermLower) ||
      log.nombreChofer.toLowerCase().includes(searchTermLower) ||
      log.motivo.toLowerCase().includes(searchTermLower) ||
      log.pesoTotal.includes(searchTermLower)

    if (matchesCommonFields) {
      return applyMaterialAndDateFilters(log)
    }

    // Search in material-specific fields
    let matchesMaterialFields = false

    if (log.tipoMaterial === "lodos" && log.residuos) {
      const details = log.residuos as LodosResiduo
      matchesMaterialFields =
        details.nombreResiduo?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.area?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.manifiestoNo?.toLowerCase().includes(searchTermLower) ||
        false
    } else if (log.tipoMaterial === "metal" && log.residuos) {
      const details = log.residuos as MetalResiduo
      matchesMaterialFields =
        details.tipoResiduo?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.item?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.remisionHMMX?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.unidad?.toLowerCase().includes(searchTermLower) ||
        false
    } else if (log.tipoMaterial === "otros" && log.residuos) {
      const details = log.residuos as OtrosResiduo
      matchesMaterialFields =
        details.tipoDesecho?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.item?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.remisionHMMX?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.unidad?.toLowerCase().includes(searchTermLower) ||
        false
    } else if (log.tipoMaterial === "destruidas" && log.residuos) {
      const details = log.residuos as DestruidasResiduo
      matchesMaterialFields =
        details.residuos?.toLowerCase().includes(searchTermLower) ||
        false ||
        details.area?.toLowerCase().includes(searchTermLower) ||
        false
    }

    return matchesMaterialFields && applyMaterialAndDateFilters(log)
  })

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const field = sortField as keyof LogEntry

    if (field === "fecha") {
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    // Sort pesoTotal as numbers after parsing
    if (field === "pesoTotal") {
      const valA = Number.parseFloat(a.pesoTotal || "0")
      const valB = Number.parseFloat(b.pesoTotal || "0")
      return sortDirection === "asc" ? valA - valB : valB - valA
    }

    // General string sorting
    if (typeof a[field] === "string" && typeof b[field] === "string") {
      const valA = a[field] as string
      const valB = b[field] as string
      return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }

    // General number sorting
    if (typeof a[field] === "number" && typeof b[field] === "number") {
      const valA = a[field] as number
      const valB = b[field] as number
      return sortDirection === "asc" ? valA - valB : valB - valA
    }

    return 0
  })

  // Paginate logs
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage)
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle sort
  const handleSort = (field: keyof LogEntry | "fecha") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle log selection
  const handleLogSelect = (log: LogEntry) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  // Get unique material types for filter
  const materialTypes = Array.from(
    new Set(
      logs
        .map((log) => log.tipoMaterial)
        .filter((type) => typeof type === 'string' && type.trim() !== '')
    )
  )

  // Calculate total weight
  const calculateTotalWeight = () => {
    return filteredLogs
      .filter(log => !(log.residuos && 'unidad' in log.residuos && typeof log.residuos.unidad === 'string' && log.residuos.unidad.toLowerCase() === 'pza'))
      .reduce((total, log) => total + Number.parseFloat(log.pesoTotal), 0)
      .toFixed(2)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setMaterialFilter("all")
    setStartDate(undefined)
    setEndDate(undefined)
    setCurrentPage(1)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  const handleEdit = (log: LogEntry | null) => {
    if (!log) return
    setEditLog({ ...log })
    setIsEditing(true)
  }

  const handleEditChange = (field: string, value: unknown) => {
    if (!editLog) return
    setEditLog({ ...editLog, [field]: value })
  }

  const handleEditResiduoChange = (field: string, value: unknown) => {
    if (!editLog) return
    setEditLog({ ...editLog, residuos: { ...editLog.residuos, [field]: value } })
  }

  const handleEditSave = () => {
    if (!editLog) return
    setLogs((prev) => prev.map((l) => (l.folio === editLog.folio ? editLog : l)))
    setSelectedLog(editLog)
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditLog(null)
  }

  const handleDelete = (log: LogEntry | null) => {
    if (!log) return
    if (window.confirm(`¿Seguro que deseas eliminar el registro #${log.folio}?`)) {
      setLogs((prev) => prev.filter((l) => l.folio !== log.folio))
      setIsDialogOpen(false)
      setSelectedLog(null)
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
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Formulario
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Historial de Registros</h1>
            <p className="text-muted-foreground">Consulta y gestiona todos los registros de salida de residuos</p>
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar registros..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex gap-2 items-center bg-primary-foreground">
                  <Filter className="h-4 w-4" />
                  Filtros
                  <Badge className="ml-1 bg-primary text-primary-foreground">
                    {(materialFilter !== "all" ? 1 : 0) + (startDate && endDate ? 1 : 0)}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h3 className="font-medium">Tipo de Material</h3>
                  <Select
                    value={materialFilter}
                    onValueChange={(value) => {
                      setMaterialFilter(value)
                      setCurrentPage(1) // Reset to first page when filter changes
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los materiales</SelectItem>
                      {materialTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <h3 className="font-medium">Rango de Fechas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="h-4 w-4 mr-2" />
                            {startDate ? format(startDate, "dd/MM/yy") : "Inicio"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date)
                              setCurrentPage(1) // Reset to first page when date changes
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="h-4 w-4 mr-2" />
                            {endDate ? format(endDate, "dd/MM/yy") : "Fin"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => {
                              setEndDate(date)
                              setCurrentPage(1) // Reset to first page when date changes
                            }}
                            initialFocus
                            disabled={(date) => (startDate ? isBefore(date, startDate) : false)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reiniciar
                    </Button>
                    <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/export">
              <Button className="w-full md:w-auto flex gap-2 items-center">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Total de Registros</h3>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Peso Total</h3>
                <p className="text-2xl font-bold">{calculateTotalWeight()} kg</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Fecha Inicial</h3>
                <p className="text-2xl font-bold">
                  {startDate ? format(startDate, "dd MMM", { locale: es }) : "Todas"}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Fecha Final</h3>
                <p className="text-2xl font-bold">{endDate ? format(endDate, "dd MMM", { locale: es }) : "Todas"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Registros de Residuos</CardTitle>
          <CardDescription>
            {filteredLogs.length} {filteredLogs.length === 1 ? "registro encontrado" : "registros encontrados"}
            {searchTerm && (
              <span className="ml-1">
                para &quot;<span className="font-medium">{searchTerm}</span>&quot;
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/40">
                    <TableHead className="cursor-pointer w-[120px]" onClick={() => handleSort("fecha")}>
                      <div className="flex items-center">
                        Fecha
                        {sortField === "fecha" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("tipoMaterial")}>
                      <div className="flex items-center">
                        Tipo Material
                        {sortField === "tipoMaterial" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Residuo/Desecho</TableHead>
                    <TableHead>Compañía</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort("pesoTotal")}>
                      <div className="flex items-center justify-end">
                        Peso Total
                        {sortField === "pesoTotal" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      // Get summary based on type
                      const summary = {
                        tipo: (() => {
                          switch (log.tipoMaterial) {
                            case "lodos":
                              return (log.residuos as LodosResiduo).nombreResiduo || "-"
                            case "metal":
                              return (log.residuos as MetalResiduo).tipoResiduo || "-"
                            case "otros":
                              return (log.residuos as OtrosResiduo).tipoDesecho || "-"
                            case "destruidas":
                              return (log.residuos as DestruidasResiduo).residuos || "-"
                            default:
                              return "-"
                          }
                        })(),
                        item: (() => {
                          switch (log.tipoMaterial) {
                            case "lodos":
                              return (log.residuos as LodosResiduo).area || log.destino || "-"
                            case "metal":
                            case "otros":
                              const details = log.residuos as MetalResiduo | OtrosResiduo
                              return details.unidad ? `${details.cantidad || "-"} ${details.unidad}` : log.destino
                            case "destruidas":
                              return (log.residuos as DestruidasResiduo).area || log.destino || "-"
                            default:
                              return log.destino || "-"
                          }
                        })(),
                      }
                      return (
                        <TableRow key={log.folio} className="hover:bg-muted/10">
                          <TableCell>{formatShortDate(log.fecha)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.tipoMaterial}
                            </Badge>
                          </TableCell>
                          <TableCell>{summary.tipo}</TableCell>
                          <TableCell>{log.compania || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {log.pesoTotal}{" "}
                            {log.tipoMaterial === "otros" || log.tipoMaterial === "metal"
                              ? "unidad" in log.residuos
                                ? log.residuos.unidad || "KG"
                                : "KG"
                              : "KG"}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* Dialog Trigger */}
                            <Dialog
                              open={isDialogOpen && selectedLog?.folio === log.folio}
                              onOpenChange={(open) => {
                                if (!open) setSelectedLog(null)
                                setIsDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleLogSelect(log)}
                                  className="text-primary"
                                >
                                  <Info className="h-4 w-4 mr-1" />
                                  Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Registro #{selectedLog?.folio}</DialogTitle>
                                </DialogHeader>
                                {isEditing && editLog ? (
                                  <div className="space-y-6 py-4">
                                    {/* Edit mode banner */}
                                    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-200 border border-gray-400 rounded">
                                      <Pencil className="h-4 w-4 text-gray-600" />
                                      <span className="text-gray-800 font-semibold">Editando registro</span>
                                    </div>
                                    {/* General Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Fecha</h3>
                                        <input type="date" className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.fecha} onChange={e => handleEditChange('fecha', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Hora Salida</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.horaSalida} onChange={e => handleEditChange('horaSalida', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Folio</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.folio} onChange={e => handleEditChange('folio', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Departamento</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.departamento} onChange={e => handleEditChange('departamento', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Motivo</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.motivo} onChange={e => handleEditChange('motivo', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Autorizó</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.personaAutoriza} onChange={e => handleEditChange('personaAutoriza', e.target.value)} />
                                      </div>
                                    </div>
                                    {/* Transport Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Chofer</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.nombreChofer} onChange={e => handleEditChange('nombreChofer', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Compañía</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.compania} onChange={e => handleEditChange('compania', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Placas</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.placas} onChange={e => handleEditChange('placas', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">No. Económico</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.numeroEconomico} onChange={e => handleEditChange('numeroEconomico', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Procedencia</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.procedencia} onChange={e => handleEditChange('procedencia', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Destino</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.destino} onChange={e => handleEditChange('destino', e.target.value)} />
                                      </div>
                                    </div>
                                    {/* Material and Container Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Tipo Material General</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.tipoMaterial} onChange={e => handleEditChange('tipoMaterial', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Tipo Contenedor</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.tipoContenedor} onChange={e => handleEditChange('tipoContenedor', e.target.value)} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Peso Total</h3>
                                        <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={editLog.pesoTotal} onChange={e => handleEditChange('pesoTotal', e.target.value)} />
                                      </div>
                                    </div>
                                    {/* Detailed Residues Section */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-2">Detalles Específicos del Material</h3>
                                      {(() => {
                                        if (!editLog.residuos) return null
                                        switch (editLog.tipoMaterial) {
                                          case "lodos": {
                                            const details = editLog.residuos as LodosResiduo
                                            return (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Nombre Residuo</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.nombreResiduo || ''} onChange={e => handleEditResiduoChange('nombreResiduo', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Manifiesto No.</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.manifiestoNo || ''} onChange={e => handleEditResiduoChange('manifiestoNo', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Área</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.area || ''} onChange={e => handleEditResiduoChange('area', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Transporte No. Servicios</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.transporteNoServicios || ''} onChange={e => handleEditResiduoChange('transporteNoServicios', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Peso (Kg)</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.pesoKg || ''} onChange={e => handleEditResiduoChange('pesoKg', e.target.value)} />
                                                </div>
                                              </div>
                                            )
                                          }
                                          case "metal": {
                                            const details = editLog.residuos as MetalResiduo
                                            return (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Tipo Residuo</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.tipoResiduo || ''} onChange={e => handleEditResiduoChange('tipoResiduo', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.item || ''} onChange={e => handleEditResiduoChange('item', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Cantidad</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.cantidad || ''} onChange={e => handleEditResiduoChange('cantidad', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Unidad</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.unidad || ''} onChange={e => handleEditResiduoChange('unidad', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Remisión HMMX</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.remisionHMMX || ''} onChange={e => handleEditResiduoChange('remisionHMMX', e.target.value)} />
                                                </div>
                                              </div>
                                            )
                                          }
                                          case "otros": {
                                            const details = editLog.residuos as OtrosResiduo
                                            return (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Tipo Desecho</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.tipoDesecho || ''} onChange={e => handleEditResiduoChange('tipoDesecho', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.item || ''} onChange={e => handleEditResiduoChange('item', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Cantidad</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.cantidad || ''} onChange={e => handleEditResiduoChange('cantidad', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Unidad</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.unidad || ''} onChange={e => handleEditResiduoChange('unidad', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Remisión HMMX</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.remisionHMMX || ''} onChange={e => handleEditResiduoChange('remisionHMMX', e.target.value)} />
                                                </div>
                                              </div>
                                            )
                                          }
                                          case "destruidas": {
                                            const details = editLog.residuos as DestruidasResiduo
                                            return (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Residuos</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.residuos || ''} onChange={e => handleEditResiduoChange('residuos', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Área</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.area || ''} onChange={e => handleEditResiduoChange('area', e.target.value)} />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-medium text-muted-foreground">Peso</h4>
                                                  <input className="w-full bg-gray-100 border border-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm rounded px-2 py-1" value={details.peso || ''} onChange={e => handleEditResiduoChange('peso', e.target.value)} />
                                                </div>
                                              </div>
                                            )
                                          }
                                          default:
                                            return <p>No hay detalles disponibles para este tipo de material.</p>
                                        }
                                      })()}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                      <Button variant="default" size="sm" onClick={handleEditSave}>Guardar</Button>
                                      <Button variant="outline" size="sm" onClick={handleEditCancel}>Cancelar</Button>
                                    </div>
                                  </div>
                                ) : (
                                  selectedLog && (
                                    <div className="space-y-6 py-4">
                                      {/* General Info Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Fecha</h3>
                                          <p>{formatDate(selectedLog.fecha)}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Hora Salida</h3>
                                          <p>{selectedLog.horaSalida}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Folio</h3>
                                          <p>{selectedLog.folio}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Departamento</h3>
                                          <p>{selectedLog.departamento}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Motivo</h3>
                                          <p>{selectedLog.motivo}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Autorizó</h3>
                                          <p>{selectedLog.personaAutoriza}</p>
                                        </div>
                                      </div>
                                      {/* Transport Info Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Chofer</h3>
                                          <p>{selectedLog.nombreChofer}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Compañía</h3>
                                          <p>{selectedLog.compania}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Placas</h3>
                                          <p>{selectedLog.placas}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">No. Económico</h3>
                                          <p>{selectedLog.numeroEconomico}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Procedencia</h3>
                                          <p>{selectedLog.procedencia}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Destino</h3>
                                          <p>{selectedLog.destino}</p>
                                        </div>
                                      </div>
                                      {/* Material and Container Info */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 border-muted">
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Tipo Material General</h3>
                                          <p>{selectedLog.tipoMaterial}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Tipo Contenedor</h3>
                                          <p>{selectedLog.tipoContenedor}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Peso Total</h3>
                                          <p>
                                            {selectedLog.pesoTotal}{" "}
                                            {selectedLog.tipoMaterial === "otros" || selectedLog.tipoMaterial === "metal"
                                              ? "unidad" in selectedLog.residuos
                                                ? selectedLog.residuos.unidad || "KG"
                                                : "KG"
                                              : "KG"}
                                          </p>
                                        </div>
                                      </div>
                                      {/* Detailed Residues Section */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">Detalles Específicos del Material</h3>
                                        {(() => {
                                          if (!selectedLog.residuos) return null
                                          switch (selectedLog.tipoMaterial) {
                                            case "lodos": {
                                              const details = selectedLog.residuos as LodosResiduo
                                              return (
                                                <Card>
                                                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Nombre Residuo</h4>
                                                      <p>{details.nombreResiduo || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Manifiesto No.</h4>
                                                      <p>{details.manifiestoNo || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Área</h4>
                                                      <p>{details.area || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Transporte No. Servicios</h4>
                                                      <p>{details.transporteNoServicios || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Peso (Kg)</h4>
                                                      <p>{details.pesoKg || "-"}</p>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              )
                                            }
                                            case "metal": {
                                              const details = selectedLog.residuos as MetalResiduo
                                              return (
                                                <Card>
                                                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Tipo Residuo</h4>
                                                      <p>{details.tipoResiduo || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                                                      <p>{details.item || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Cantidad</h4>
                                                      <p>
                                                        {details.cantidad || "-"} {details.unidad || ""}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Remisión HMMX</h4>
                                                      <p>{details.remisionHMMX || "-"}</p>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              )
                                            }
                                            case "otros": {
                                              const details = selectedLog.residuos as OtrosResiduo
                                              return (
                                                <Card>
                                                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Tipo Desecho</h4>
                                                      <p>{details.tipoDesecho || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                                                      <p>{details.item || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Cantidad</h4>
                                                      <p>
                                                        {details.cantidad || "-"} {details.unidad || ""}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Remisión HMMX</h4>
                                                      <p>{details.remisionHMMX || "-"}</p>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              )
                                            }
                                            case "destruidas": {
                                              const details = selectedLog.residuos as DestruidasResiduo
                                              return (
                                                <Card>
                                                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Residuos</h4>
                                                      <p>{details.residuos || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Área</h4>
                                                      <p>{details.area || "-"}</p>
                                                    </div>
                                                    <div>
                                                      <h4 className="text-sm font-medium text-muted-foreground">Peso</h4>
                                                      <p>{details.peso || "-"} kg</p>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              )
                                            }
                                            default:
                                              return <p>No hay detalles disponibles para este tipo de material.</p>
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  )
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => selectedLog && generatePdf(selectedLog)}
                                  >
                                    <Download className="h-4 w-4" />
                                    Descargar PDF
                                  </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 mt-2"
                                  onClick={() => handleEdit(selectedLog)}
                                  disabled={!selectedLog}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex items-center gap-2 mt-2 ml-2"
                                  onClick={() => handleDelete(selectedLog)}
                                  disabled={!selectedLog}
                                >
                                  Eliminar
                                </Button>
                              </DialogContent>
                              
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron registros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-4 pb-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="sm"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      size="sm"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(index + 1)
                      }}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    size="sm"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  )
}


   