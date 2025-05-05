import { format } from "date-fns"
import { es } from "date-fns/locale"
import * as XLSX from "xlsx"

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

export const formatExcelDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yy")
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
      return (log.residuos as LodosResiduo).area || "-"
    case "metal":
    case "otros": {
      const details = log.residuos as MetalResiduo | OtrosResiduo
      if (details.unidad === "PZA") {
        return `${details.cantidad || "-"} ${details.unidad} - ${details.item || "-"}`
      }
      return details.item || "-"
    }
    case "destruidas":
      return (log.residuos as DestruidasResiduo).area || "-"
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

// Export to Excel based on material type
export const exportLogsToExcel = (logs: LogEntry[], materialType?: string) => {
  // Group logs by material type
  const logsByMaterial: Record<string, LogEntry[]> = {}

  logs.forEach((log) => {
    if (!logsByMaterial[log.tipoMaterial]) {
      logsByMaterial[log.tipoMaterial] = []
    }
    logsByMaterial[log.tipoMaterial].push(log)
  })

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // If specific material type is provided, only export that type
  const materialsToExport = materialType ? [materialType] : Object.keys(logsByMaterial)

  materialsToExport.forEach((material) => {
    const materialLogs = logsByMaterial[material] || []
    if (materialLogs.length === 0) return

    let worksheetData: any[] = []

    // Format data based on material type
    switch (material) {
      case "metal":
        // Format for metal (chatarra) as in first image
        worksheetData = formatMetalExport(materialLogs)
        break
      case "otros":
        // Format for recyclables (others) as in second image
        worksheetData = formatRecyclablesExport(materialLogs)
        break
      case "lodos":
        // Format for special handling waste (lodos) as in third image
        worksheetData = formatSpecialWasteExport(materialLogs)
        break
      case "destruidas":
        // Format for urethane seals (destruidas) as in fourth image
        worksheetData = formatDestruidasExport(materialLogs)
        break
      default:
        // Default format
        worksheetData = formatDefaultExport(materialLogs)
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, getMaterialSheetName(material))
  })

  return workbook
}

// Helper functions for formatting different export types
const formatMetalExport = (logs: LogEntry[]) => {
  // Header rows (title and subtitle)
  const headerRows = [
    {
      A: "",
      B: "",
      C: "RESIDUOS: CHATARRA PRENSA KIA & H. STEEL, TARIMAS DE FIERRO(Steel parts), CARROCERIA, AUTOS, ALUMINIO, COBRE/ SCRAP: SCRAP PRESS KIA & H. STEEL, IRON PALLETS, BODYWORK, CARS, ALUMINUM, COPPER",
    },
    {
      A: "",
      B: "",
      C: "LOGBOOK OF SPECIAL HANDLING WASTE - FERROUS AND NON-FERROUS",
    },
  ]

  // Column headers
  const columnHeaders = {
    A: "DATE OF COLLECTION",
    B: "TYPE OF WASTE",
    C: "COMPANY (TRANSPORTING COMPANY)",
    D: "COMPANY (PURCHASE AND SALE OF RECYCLABLES)",
    E: "ITEM",
    F: "QUANTITY",
    G: "UNIT",
    H: "REMISSION HMMX",
  }

  // Data rows
  const dataRows = logs.map((log) => {
    const details = log.residuos as MetalResiduo
    return {
      A: formatExcelDate(log.fecha),
      B: "Chatarra Ferrica",
      C: log.compania,
      D: "Hyundai Materials Mexico S. DE R.L DE C.V",
      E: details.item || "-",
      F: log.pesoTotal,
      G: details.unidad || "KG",
      H: details.remisionHMMX || "-",
    }
  })

  return [...headerRows, columnHeaders, ...dataRows]
}

const formatRecyclablesExport = (logs: LogEntry[]) => {
  // Header rows (title and subtitle)
  const headerRows = [
    {
      A: "",
      B: "",
      C: "RESIDUOS: CARTON, PLASTICO, MADERA, ELECTRONICOS,AUTOPARTES PLASTICAS (laminas de plástico),HIELO SECO, CHAROLAS DE POLIESTIRENO (laminas de plástico)",
    },
    {
      A: "",
      B: "",
      C: "SPECIAL HANDLING WASTE LOGBOOK - RECYCLABLES",
    },
  ]

  // Column headers
  const columnHeaders = {
    A: "DATE OF COLLECTION",
    B: "TYPE OF WASTE",
    C: "COMPANY (TRANSPORTING COMPANY)",
    D: "COMPANY (PURCHASE AND SALE OF RECYCLABLES)",
    E: "ITEM",
    F: "QUANTITY",
    G: "UNIT",
    H: "REMISSION HMMX",
  }

  // Data rows
  const dataRows = logs.map((log) => {
    const details = log.residuos as OtrosResiduo
    let wasteType = "Plastico/Plasticos"
    let item = details.item || "-"
    let unit = details.unidad || "KG"

    if (details.tipoDesecho?.toLowerCase().includes("madera")) {
      wasteType = "Wood/Madera"
      item = "Wood Pallet / Tarima de Madera"
      // Wood is often measured in pieces
      if (Number(log.pesoTotal) <= 10) unit = "PZA"
    } else if (details.tipoDesecho?.toLowerCase().includes("carton")) {
      wasteType = "Paper and Cardboard/Papel y Carton"
      item = "Paper / Carton"
    }

    return {
      A: formatExcelDate(log.fecha),
      B: wasteType,
      C: log.compania,
      D: "Hyundai Materials Mexico S. DE R.L DE C.V",
      E: item,
      F: log.pesoTotal,
      G: unit,
      H: details.remisionHMMX || "-",
    }
  })

  return [...headerRows, columnHeaders, ...dataRows]
}

const formatSpecialWasteExport = (logs: LogEntry[]) => {
  // Header rows (title and subtitle)
  const headerRows = [
    {
      A: "",
      B: "Movement that inspires",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
      K: "",
      L: "",
      M: "",
      N: "",
      O: "",
    },
    {
      A: "",
      B: "",
      C: "Bitácora de Residuos de Manejo Especial (RMOG) 2024",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
      K: "",
      L: "",
      M: "",
      N: "",
      O: "",
    },
  ]

  // Column headers
  const columnHeaders = {
    A: "Fecha de recolección",
    B: "Tipo de residuo",
    C: "Empresa Transportista",
    D: "Sitio de Disposición Final",
    E: "Residuo",
    F: "Manifiesto No.",
    G: "Área",
    H: "Transporte No. de Servicio",
    I: "Peso (Kg)",
  }

  // Data rows
  const dataRows = logs.map((log) => {
    const details = log.residuos as LodosResiduo
    return {
      A: formatExcelDate(log.fecha),
      B: "RME",
      C: log.compania,
      D: log.destino,
      E: details.nombreResiduo || "Lodos provenientes del tratamiento de aguas residuales",
      F: details.manifiestoNo || "-",
      G: details.area || "Planta",
      H: details.transporteNoServicios || "1",
      I: log.pesoTotal,
    }
  })

  return [...headerRows, columnHeaders, ...dataRows]
}

const formatDestruidasExport = (logs: LogEntry[]) => {
  // Header rows (title and subtitle)
  const headerRows = [
    {
      A: "",
      B: "Movement that inspires",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
      K: "",
      L: "",
      M: "",
      N: "",
      O: "",
    },
    {
      A: "",
      B: "",
      C: "Bitácora de Residuos de Manejo Especial (SELLO) 2024",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
      K: "",
      L: "",
      M: "",
      N: "",
      O: "",
    },
  ]

  // Column headers
  const columnHeaders = {
    A: "Fecha de recolección",
    B: "Tipo de residuo",
    C: "Empresa Transportista",
    D: "Sitio de Disposición Final",
    E: "Residuo",
    F: "Área",
    G: "Peso (Kg)",
  }

  // Data rows
  const dataRows = logs.map((log) => {
    const details = log.residuos as DestruidasResiduo
    return {
      A: formatExcelDate(log.fecha),
      B: "RME",
      C: "RED AMBIENTAL",
      D: log.destino || "TRENERGY",
      E: details.residuos || "SELLO DE URETANO",
      F: details.area || "ENSAMBLE",
      G: log.pesoTotal,
    }
  })

  return [...headerRows, columnHeaders, ...dataRows]
}

const formatDefaultExport = (logs: LogEntry[]) => {
  return logs.map((log) => {
    return {
      Fecha: formatExcelDate(log.fecha),
      "Hora Salida": log.horaSalida,
      Folio: log.folio,
      Departamento: log.departamento,
      Motivo: log.motivo,
      Chofer: log.nombreChofer,
      Compañía: log.compania,
      Procedencia: log.procedencia,
      Destino: log.destino,
      Placas: log.placas,
      "No. Económico": log.numeroEconomico,
      "Tipo Material": log.tipoMaterial,
      "Peso Total (kg)": log.pesoTotal,
      "Tipo Contenedor": log.tipoContenedor,
      "Autorizado Por": log.personaAutoriza,
    }
  })
}

// Helper function to get sheet name based on material type
const getMaterialSheetName = (material: string) => {
  switch (material) {
    case "metal":
      return "Chatarra"
    case "otros":
      return "Reciclables"
    case "lodos":
      return "Lodos"
    case "destruidas":
      return "Sellos"
    default:
      return material.charAt(0).toUpperCase() + material.slice(1)
  }
}
