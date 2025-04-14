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
  employee_id: string
  role: string | null
  name: string | null
  email: string | null
}

export interface LogData {
  notes: string
  completionDate: string
  attachments: string[]
  completionPercentage: number
}