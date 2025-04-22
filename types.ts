export interface Task {
  id: string
  title: string
  description: string
  status: string
  progress: number
  target: number
  frequency: "daily" | "weekly" | "monthly"
  dueDate: string
  createdAt: string
  category?: "waste" | "maintenance" | "audit" | "safety"
}

export interface LogData {
  notes: string
  completionDate: string
  attachments: string[]
  completionPercentage: number
}


export interface UserProfile {
  id: string
  employee_id: string
  role: string | null
  full_name: string | null
  email: string | null
  is_active: boolean
  created_at: string
}

export interface LogData {
  notes: string
  completionDate: string
  attachments: string[]
  completionPercentage: number
}

export type WasteItem = {
  id: string
  nombreResiduo: string
  peso: string
}

export type WasteDisposal = {
  fecha: string
  nombreChofer: string
  horaSalida: string
  compania: string
  procedencia: string
  destino: string
  placas: string
  numeroEconomico: string
  folio: string
  departamento: string
  motivo: string
  tipoMaterial: string
  residuos: WasteItem[]
  residuosSeleccionados: string[]
  pesoTotal: string
  tipoContenedor: string
  personaAutoriza: string
}
