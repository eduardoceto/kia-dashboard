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
export interface TaskCardProps {
  id: string
  title: string
  description: string
  status: "now" | "pending" | "overdue" | "completed"
  progress: 0 | 100 // Binary progress - either 0 or 100
  frequency: "daily" | "weekly" | "monthly"
  dueDate: string
  createdAt: string
  category: "waste" | "maintenance" | "audit" | "safety"
  wasteType: string
  area: string
}

export interface LogData {
  notes: string
  completionDate: string
  attachments: string[]
  completionPercentage: number
}

export interface LogDataModalProps {
  tipoResiduo: string
  fecha: string
  area: string
  peso: number
}



export interface UserProfile {
  id: string
  employee_id: string
  role: string | null
  first_name: string
  last_name: string
  email: string | null
  is_active: boolean
  created_at: string
  locale: string
  area_id: string
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

export type waste_types = {
  waste_types_id: number
  waste_type: string
}

export type wastes = {
  wastes_id: number
  waste_type_id: number
  waste: string
}

export type waste_logs = {
  logs_id: number
  user_id: number
  area_id: number
  weight: number
  REM: number
  Type: number
  driver_id: number
  recolection_date: Date
}

export type users = {
  id: number
  role: string
  employee_id: string
  is_active: boolean
  created_at: Date
  locale: string
  first_name: string
  last_name: string
  email: string
  area_id: number
}

export type areas = {
  areas_id: number
  name: string
}

export type drivers = {
  id: number
  first_name: string
  last_name: string
  company: string
  origin: string
  destination: string
  vehicle_plate: string
  economic_number: string
  is_active: boolean
  created_at: Date
}

export type WasteDisposalLog = {
  log_id: number; // primary key
  user_id: string; // foreign key to users (UUID)
  area_id: string; // foreign key to areas (UUID)
  driver_id: string; // foreign key to drivers (UUID)
  date: string; // formerly 'fecha'
  departure_time: string; // formerly 'hora_salida'
  folio: string;
  department: string; // formerly 'departamento'
  reason: string; // formerly 'motivo'
  material_type: string; // formerly 'tipo_material'
  container_type: string; // formerly 'tipo_contenedor'
  authorizing_person: string; // formerly 'persona_autoriza'
  waste_details: object; // JSONB, dynamic waste details (formerly 'residuos')
  total_weight: string; // formerly 'peso_total'
  created_at: Date;
  updated_at: Date;
};