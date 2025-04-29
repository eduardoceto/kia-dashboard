"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash, Calendar, ArrowRight, Wrench, ClipboardCheck, Shield, Clock, AlertTriangle, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, isToday, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"

interface Task {
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

interface TaskCardProps {
  task: Task
  onUploadLog: () => void
  onDelete: () => void
}

const iconStyles = {
  waste: "bg-secondary text-white",
  maintenance: "bg-blue-900/20 text-blue-400",
  audit: "bg-amber-900/20 text-amber-400",
  safety: "bg-green-900/20 text-green-400",
}

const statusConfig = {
  now: {
    bg: "bg-blue-900/20",
    class: "text-blue-400",
    icon: Clock,
    label: "Now",
  },
  pending: {
    bg: "bg-amber-900/20",
    class: "text-amber-400",
    icon: Clock,
    label: "Pending",
  },
  overdue: {
    bg: "bg-red-900/20",
    class: "text-red-400",
    icon: AlertTriangle,
    label: "Overdue",
  },
  completed: {
    bg: "bg-green-900/20",
    class: "text-green-400",
    icon: ClipboardCheck,
    label: "Completed",
  },
}

const frequencyLabels = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
}

export function TaskCard({ task, onUploadLog, onDelete }: TaskCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const router = useRouter()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "waste":
        return Trash
      case "maintenance":
        return Wrench
      case "audit":
        return ClipboardCheck
      case "safety":
        return Shield
      default:
        return Trash
    }
  }

  const handleUploadLogClick = () => {
    // Option 1: Use the modal approach
    onUploadLog()

    // Option 2: Navigate to the dedicated page
    // router.push(`/upload-log?taskId=${task.id}`)
  }

  const IconComponent = getCategoryIcon(task.category)
  const status = task.status.toLowerCase() as keyof typeof statusConfig
  const StatusIcon = statusConfig[status]?.icon || Clock
  const statusLabel = statusConfig[status]?.label || "Pending"

  // Format due date as relative string in Spanish
  let dueDateLabel = "-"
  if (typeof task.dueDate === "string" && task.dueDate.trim() !== "") {
    let dueDateObj: Date | null = null
    try {
      // Attempt to parse as ISO 8601 first
      let parsedDate = parseISO(task.dueDate)
      // If parseISO results in an invalid date, try the native Date constructor
      if (!isValid(parsedDate)) {
        parsedDate = new Date(task.dueDate)
      }
      // Final check if the date is valid
      if (isValid(parsedDate)) {
        dueDateObj = parsedDate
      }
    } catch {
      // If any parsing error occurs, dueDateObj remains null
    }

    if (dueDateObj) {
      if (isToday(dueDateObj)) {
        dueDateLabel = "Hoy"
      } else {
        try {
          // Ensure the date object passed to formatDistanceToNow is valid
          dueDateLabel = formatDistanceToNow(dueDateObj, { locale: es, addSuffix: true })
        } catch (e) {
          console.error("Error formatting date:", e, "Original value:", task.dueDate)
          dueDateLabel = "-" // Fallback on formatting error
        }
      }
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        "w-[280px] shrink-0",
        "bg-primary/75",
        "rounded-md",
        "border border-tertiarty ",
        "hover:border-foreground",
        "transition-all duration-200",
        "shadow-sm backdrop-blur-xl",
        "relative",
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div
            className={cn("p-2 rounded-lg", iconStyles[task.category as keyof typeof iconStyles] || iconStyles.waste)}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
              statusConfig[status]?.bg || "bg-zinc-800",
              statusConfig[status]?.class || "text-zinc-400",
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusLabel}
          </div>
        </div>

        <div className="">
          <h3 className="text-sm font-medium text-zinc-100 mb-1">{task.title}</h3>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-200">Progress</span>
            <span className="text-white">
              {task.progress === 100 ? "Completado" : "No Completado"}
            </span>
          </div>
          <div className="h-1.5 bg-color-primary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                task.progress === 100 ? "bg-white" : "bg-zinc-500",
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-zinc-200">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <span>Vence: {dueDateLabel}</span>
          </div>
          <div className="flex items-center justify-between">
          </div>
        </div>
      </div>

      <div className="mt-auto border-t mb-auto border-foreground">
        {isHovering ? (
          <button
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 px-3",
              "text-xs font-medium",
              "text-white",
              "hover:text-blue-200",
              "hover:bg-blue-700/20",
              "transition-colors duration-200",
            )}
            onClick={handleUploadLogClick}
          >
            Upload Log
            <Upload className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 px-3",
              "text-xs font-medium",
              "text-zinc-200",
              "hover:text-zinc-100",
              "hover:bg-zinc-800/50 ",
              "transition-colors duration-200",
            )}
            onClick={() => router.push(`/upload-log?taskId=${task.id}`)}
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Delete button that appears on hover */}
      {isHovering && (
        <button
          onClick={onDelete}
          className={cn(
            "absolute top-12 right-2 p-1.5 rounded-full",
            "bg-red-900/20 text-red-400",
            "hover:bg-red-900/30 transition-colors",
          )}
          aria-label="Delete task"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  )
}
