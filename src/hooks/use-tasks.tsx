"use client"

import { useState, useEffect } from "react"

// Define the Task type
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

// Define the LogData type
interface LogData {
  tipoResiduo: string
  fecha: string
  area: string
  peso: number
}

// Helper function to check if a date is in the past
const isDatePast = (dateString: string) => {
  // Parse the date string (assuming format DD/MM/YYYY)
  const [day, month, year] = dateString.split("/").map(Number)
  const dueDate = new Date(year, month - 1, day) // month is 0-indexed in JS Date
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to beginning of day for fair comparison

  return dueDate < today
}

// Helper function to check if a date is today
const isDateToday = (dateString: string) => {
  // Parse the date string (assuming format DD/MM/YYYY)
  const [day, month, year] = dateString.split("/").map(Number)
  const dueDate = new Date(year, month - 1, day) // month is 0-indexed in JS Date
  const today = new Date()

  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  )
}

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Desechos Metalicos",
    description: "Desechos metalicos reciclables de la planta 1",
    status: "now", // Today's task
    progress: 0,
    frequency: "daily",
    dueDate: new Date()
      .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "/"),
    createdAt: new Date().toISOString(),
    category: "waste",
    wasteType: "Metálico",
    area: "Planta 1",
  },
  {
    id: "2",
    title: "Residuos Plásticos",
    description: "Plásticos y envases de la zona de producción",
    status: "pending", // Future task
    progress: 0,
    frequency: "weekly",
    dueDate: "15/05/2025",
    createdAt: new Date().toISOString(),
    category: "waste",
    wasteType: "Plástico",
    area: "Planta 2",
  },
  {
    id: "3",
    title: "Papel y Cartón",
    description: "Documentación y embalajes de cartón",
    status: "overdue", // Past due task
    progress: 0,
    frequency: "monthly",
    dueDate: "01/01/2023",
    createdAt: new Date().toISOString(),
    category: "waste",
    wasteType: "Papel/Cartón",
    area: "Planta 4",
  },
  {
    id: "4",
    title: "Residuos Electrónicos",
    description: "Componentes electrónicos y baterías",
    status: "pending",
    progress: 0,
    frequency: "weekly",
    dueDate: "22/05/2025",
    createdAt: new Date().toISOString(),
    category: "waste",
    wasteType: "Electrónico",
    area: "Planta 3",
  },
]

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Update task statuses based on due dates
  useEffect(() => {
    const updateTaskStatuses = () => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          // Skip completed tasks
          if (task.status === "completed") return task

          // Check if the task is overdue
          if (isDatePast(task.dueDate)) {
            return { ...task, status: "overdue" }
          }

          // Check if the task is due today
          if (isDateToday(task.dueDate)) {
            return { ...task, status: "now" }
          }

          // Otherwise, it's pending
          return { ...task, status: "pending" }
        }),
      )
    }

    // Update statuses initially
    updateTaskStatuses()

    // Set up a daily check to update statuses
    const intervalId = setInterval(updateTaskStatuses, 1000 * 60 * 60 * 24) // Once per day

    return () => clearInterval(intervalId)
  }, [])

  // Complete a task with log data
  const completeTask = (taskId: string, logData: LogData) => {
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === taskId) {
          // Mark as completed
          return { ...task, status: "completed", progress: 100 }
        }
        return task
      })
    })

    // Remove completed tasks after a short delay (to show completion state)
    setTimeout(() => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    }, 2000)
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
