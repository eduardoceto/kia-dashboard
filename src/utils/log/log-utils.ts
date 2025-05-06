import { format } from "date-fns"
import { es } from "date-fns/locale"

// Define specific types for each material's residue details
export type LodosResiduo = {
  nombreResiduo?: string
  manifiestoNo?: string
  area?: string
  transporteNoServicios?: string
  pesoKg?: number
}

export type MetalResiduo = {
  tipoResiduo?: string
  item?: string
  cantidad?: number
  unidad?: string
  remisionHMMX?: string
  remisionKia?: string
}

export type OtrosResiduo = {
  tipoDesecho?: string
  item?: string
  cantidad?: number
  unidad?: string
  remisionHMMX?: string
  remisionKia?: string
}

export type DestruidasResiduo = {
  residuos?: string
  area?: string
  peso?: number
  item?: string
}

// Union type for the 'residuos' field
export type ResiduoDetails = LodosResiduo | MetalResiduo | OtrosResiduo | DestruidasResiduo

// LogEntry type
export type LogEntry = {
  fecha: string
  horaSalida: string
  folio: string
  departamento: string
  motivo: string
  nombreChofer: string
  compania: string
  procedencia: string
  destino: string
  placas: string
  numeroEconomico: string
  tipoMaterial: "lodos" | "metal" | "otros" | "destruidas" | string
  residuos: ResiduoDetails
  pesoTotal: string
  tipoContenedor: string
  personaAutoriza: string
}

// Format date functions
export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "Fecha inválida"
  }
}

export const formatShortDate = (dateString: string) => {
  try {
    const date = new Date(dateString + "T00:00:00")
    return format(date, "d MMM yyyy", { locale: es })
  } catch (error) {
    console.error("Error formatting short date:", dateString, error)
    return "Fecha inválida"
  }
}

export const formatTableDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "Fecha inválida"
  }
}

// Get residue name based on material type
export const getResidueName = (log: LogEntry) => {
  if (!log.residuos) return "-"

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
}

// Get item/area based on material type with unit information
export const getResidueItem = (log: LogEntry) => {
  if (!log.residuos) return "-"

  switch (log.tipoMaterial) {
    case "lodos":
      return (log.residuos as LodosResiduo).nombreResiduo || "-"
    case "metal":
      const details = log.residuos as MetalResiduo
      if (details.unidad === "PZA") {
        return `${details.cantidad || "-"} ${details.unidad} - ${details.item || "-"}`
      }
      return details.item || "-"
    case "otros": {
      const details = log.residuos as OtrosResiduo
      if (details.unidad === "PZA") {
        return `${details.cantidad || "-"} ${details.unidad} - ${details.item || "-"}`
      }
      return details.item || "-"
    }
    case "destruidas":
      return (log.residuos as DestruidasResiduo).item || "-"
    default:
      return "-"
  }
}

export const getResidueQuantity = (log: LogEntry) => {
  if (!log.residuos) return "-"

  switch (log.tipoMaterial) {
    case "lodos":
      return (log.residuos as LodosResiduo).pesoKg || "-"
    case "metal":
      return (log.residuos as MetalResiduo).cantidad || "-"
    case "otros":
      return (log.residuos as OtrosResiduo).cantidad || "-"
    case "destruidas":
      return (log.residuos as DestruidasResiduo).peso || "-"
    default:
      return "-"
  }
}

export const getResidueArea = (log: LogEntry) => {
  if (!log.residuos) return "-"
  switch (log.tipoMaterial) {
    case "lodos":
      return (log.residuos as LodosResiduo).area || "-"
    case "destruidas":
      return (log.residuos as DestruidasResiduo).area || "-"
    default:
      return "-"
  }
}
export const getResidueTransport = (log: LogEntry) => {
  if (!log.residuos) return "-"
  switch (log.tipoMaterial) {
    case "lodos":
      return (log.residuos as LodosResiduo).transporteNoServicios || "-"
    default:
      return "-"
  }
}

export const getResidueUnit = (log: LogEntry) => {
  if (!log.residuos) return "-"
  switch (log.tipoMaterial) {
    case "metal":
      return (log.residuos as MetalResiduo).unidad || "-"
    default:
      return "-"
  }
}

export const getResidueRemision = (log: LogEntry) => {
  if (!log.residuos) return "-"
  switch (log.tipoMaterial) {
    case "metal":
      return (log.residuos as MetalResiduo).remisionHMMX || "-"
    case "otros":
      return (log.residuos as OtrosResiduo).remisionHMMX || "-"
    default:
      return "-"
  }
}

export const getResidueManifestNo = (log: LogEntry) => {
  if (!log.residuos) return "-"
  switch (log.tipoMaterial) {
    case "lodos":
      return (log.residuos as LodosResiduo).manifiestoNo || "-"
    default:
      return "-"
  }
  
}

// Calculate total weight
export const calculateTotalWeight = (logs: LogEntry[]) => {
  return logs.reduce((total, log) => total + Number.parseFloat(log.pesoTotal), 0).toFixed(2)
}

// Calculate total weight by material type
export const calculateTotalWeightByMaterial = (logs: LogEntry[]) => {
  const totals: Record<string, number> = {}

  logs.forEach((log) => {
    const materialType = log.tipoMaterial
    const weight = Number.parseFloat(log.pesoTotal)

    if (!totals[materialType]) {
      totals[materialType] = 0
    }

    totals[materialType] += weight
  })

  return totals
}
