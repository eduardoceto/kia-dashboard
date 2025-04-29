"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, ChevronDown, ChevronUp, FileSpreadsheet, Search } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"
import { cn } from "@/lib/utils"
import { getHistoricalLogs } from "@/src/components/testData/data"

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string>("fecha")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [materialFilter, setMaterialFilter] = useState<string>("all") // default to "all"

  // Get historical logs
  const logs = getHistoricalLogs()

  // Items per page
  const itemsPerPage = 10

  // Filter logs based on search term and material filter
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.personaAutoriza.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.residuos.some((r) => r.nombreResiduo.toLowerCase().includes(searchTerm.toLowerCase()))

    // Fix: "all" means no filter
    const matchesMaterial = materialFilter === "all" ? true : log.tipoMaterial === materialFilter

    return matchesSearch && matchesMaterial
  })

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortField === "fecha") {
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    if (sortField === "tipoMaterial") {
      return sortDirection === "asc"
        ? a.tipoMaterial.localeCompare(b.tipoMaterial)
        : b.tipoMaterial.localeCompare(a.tipoMaterial)
    }

    if (sortField === "personaAutoriza") {
      return sortDirection === "asc"
        ? a.personaAutoriza.localeCompare(b.personaAutoriza)
        : b.personaAutoriza.localeCompare(a.personaAutoriza)
    }

    if (sortField === "folio") {
      return sortDirection === "asc" ? a.folio.localeCompare(b.folio) : b.folio.localeCompare(a.folio)
    }

    return 0
  })

  // Paginate logs
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage)
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle log selection
  const handleLogSelect = (log: any) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  // Get unique material types for filter
  const materialTypes = Array.from(new Set(logs.map((log) => log.tipoMaterial)))

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: es })
  }

  // Format date to display as day and month
  const formatShortDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy", { locale: es })
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Formulario
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Historial de Registros</h1>
            <p className="text-muted-foreground">Consulta y gestiona todos los registros de salida de residuos</p>
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar registros..."
                className="pl-9 bg-background/5 border-muted"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <Select
              value={materialFilter}
              onValueChange={(value) => {
                setMaterialFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-background/5 border-muted">
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

            <Link href="/export">
              <Button variant="outline" className="w-full md:w-auto bg-background/5 border-muted hover:bg-muted/20">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-muted bg-background/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/10">
                <TableHead className="cursor-pointer w-[120px]" onClick={() => handleSort("fecha")}>
                  <div className="flex items-center">
                    Fecha
                    {sortField === "fecha" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("tipoMaterial")}>
                  <div className="flex items-center">
                    Tipo de Material
                    {sortField === "tipoMaterial" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Residuos</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("personaAutoriza")}>
                  <div className="flex items-center">
                    Persona que Autorizó
                    {sortField === "personaAutoriza" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("folio")}>
                  <div className="flex items-center">
                    Folio
                    {sortField === "folio" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow key={log.folio} className="hover:bg-muted/10">
                    <TableCell>{formatShortDate(log.fecha)}</TableCell>
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
                            +{log.residuos.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{log.personaAutoriza}</TableCell>
                    <TableCell>{log.folio}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isDialogOpen && selectedLog?.folio === log.folio} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLogSelect(log)}
                            className="bg-background/10 border-muted hover:bg-muted/20"
                          >
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalles del Registro #{log.folio}</DialogTitle>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Fecha</h3>
                                  <p>{formatDate(selectedLog.fecha)}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Hora de Salida</h3>
                                  <p>{selectedLog.horaSalida}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Folio</h3>
                                  <p>{selectedLog.folio}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Departamento</h3>
                                  <p>{selectedLog.departamento}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Motivo</h3>
                                  <p>{selectedLog.motivo}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Nombre de Chofer</h3>
                                  <p>{selectedLog.nombreChofer}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Compañía</h3>
                                  <p>{selectedLog.compania}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Procedencia</h3>
                                  <p>{selectedLog.procedencia}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Destino</h3>
                                  <p>{selectedLog.destino}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Placas</h3>
                                  <p>{selectedLog.placas}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Número Económico</h3>
                                  <p>{selectedLog.numeroEconomico}</p>
                                </div>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Tipo de Material</h3>
                                <p>{selectedLog.tipoMaterial}</p>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Residuos</h3>
                                <div className="mt-2 border rounded-md divide-y border-muted divide-muted">
                                  {selectedLog.residuos.map((residuo: any, index: number) => (
                                    <div key={index} className="p-2 flex justify-between">
                                      <span>{residuo.nombreResiduo}</span>
                                      <span className="font-medium">{residuo.peso} kg</span>
                                    </div>
                                  ))}
                                  <div className="p-2 flex justify-between bg-muted/10">
                                    <span className="font-medium">Peso Total</span>
                                    <span className="font-medium">{selectedLog.pesoTotal} kg</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Tipo de Contenedor</h3>
                                  <p>{selectedLog.tipoContenedor}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground">Persona que Autoriza</h3>
                                  <p>{selectedLog.personaAutoriza}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
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

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
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
    </div>
  )
}



