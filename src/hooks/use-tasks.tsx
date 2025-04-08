"use client"

import { useState } from "react"

// Define the Task type
interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  progress: number
  target: number
  frequency: string
  dueDate: string
  createdAt: string
  category?: "waste" | "maintenance" | "audit" | "safety"
}

// Define the LogData type
interface LogData {
  completionPercentage: number
  [key: string]: any // Allows for additional log data
}

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Desechos Metalicos",
    description: "Desechos metalicos reciclables de la planta 1",
    status: "in-progress",
    progress: 0,
    target: 1,
    frequency: "daily",
    dueDate: "Marzo 2025",
    createdAt: new Date().toISOString(),
    category: "waste",
  },
  {
    id: "2",
    title: "Mantenimiento Preventivo",
    description: "Revisión de equipos de seguridad",
    status: "pending",
    progress: 25,
    target: 3,
    frequency: "weekly",
    dueDate: "Abril 2025",
    createdAt: new Date().toISOString(),
    category: "maintenance",
  },
  {
    id: "3",
    title: "Auditoría Ambiental",
    description: "Documentación de procesos de reciclaje",
    status: "in-progress",
    progress: 60,
    target: 1,
    frequency: "monthly",
    dueDate: "Mayo 2025",
    createdAt: new Date().toISOString(),
    category: "audit",
  },
  {
    id: "4",
    title: "Inspección de Seguridad",
    description: "Verificación de equipos de protección personal",
    status: "pending",
    progress: 10,
    target: 2,
    frequency: "weekly",
    dueDate: "Junio 2025",
    createdAt: new Date().toISOString(),
    category: "safety",
  },
]

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Complete a task with log data
  const completeTask = (taskId: string, logData: LogData) => {
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === taskId) {
          // If completion is 100%, mark as completed
          if (logData.completionPercentage === 100) {
            return { ...task, status: "completed", progress: 100 }
          }
          // Otherwise update progress
          return { ...task, progress: logData.completionPercentage }
        }
        return task
      })
    })

    // Remove completed tasks after a short delay (to show completion state)
    if (logData.completionPercentage === 100) {
      setTimeout(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      }, 2000)
    }
  }

  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  }

  // Add a new task
  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    }
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  return {
    tasks,
    completeTask,
    deleteTask,
    addTask,
  }
}
