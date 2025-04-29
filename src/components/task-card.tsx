"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash, Calendar, ArrowRight, Wrench, ClipboardCheck, Shield, Clock, AlertTriangle, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

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
  waste: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
  maintenance: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  audit: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  safety: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
}

const statusConfig = {
  now: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    class: "text-blue-600 dark:text-blue-400",
    icon: Clock,
    label: "Now",
  },
  pending: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    class: "text-amber-600 dark:text-amber-400",
    icon: Clock,
    label: "Pending",
  },
  overdue: {
    bg: "bg-red-50 dark:bg-red-900/20",
    class: "text-red-600 dark:text-red-400",
    icon: AlertTriangle,
    label: "Overdue",
  },
  completed: {
    bg: "bg-green-50 dark:bg-green-900/20",
    class: "text-green-600 dark:text-green-400",
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

  return (
    <div
      className={cn(
        "flex flex-col",
        "w-[280px] shrink-0",
        "bg-white dark:bg-zinc-900/70",
        "rounded-xl",
        "border border-zinc-100 dark:border-zinc-800",
        "hover:border-zinc-200 dark:hover:border-zinc-700",
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
              statusConfig[status]?.bg || "bg-zinc-100 dark:bg-zinc-800",
              statusConfig[status]?.class || "text-zinc-600 dark:text-zinc-400",
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusLabel}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">{task.title}</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{task.description}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
            <span className="text-zinc-900 dark:text-zinc-100">
              {task.progress === 100 ? "Completed" : "Not Completed"}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                task.progress === 100 ? "bg-green-500 dark:bg-green-400" : "bg-zinc-900 dark:bg-zinc-100",
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <span>Vence: {task.dueDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs">
              {frequencyLabels[task.frequency as keyof typeof frequencyLabels]}
            </span>
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs">{task.area}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
        {isHovering ? (
          <button
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 px-3",
              "text-xs font-medium",
              "text-blue-600 dark:text-blue-400",
              "hover:text-blue-700 dark:hover:text-blue-300",
              "hover:bg-blue-50 dark:hover:bg-blue-900/20",
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
              "text-zinc-600 dark:text-zinc-400",
              "hover:text-zinc-900 dark:hover:text-zinc-100",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
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
            "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
            "hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors",
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
