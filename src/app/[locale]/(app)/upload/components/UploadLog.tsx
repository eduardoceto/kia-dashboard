"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Card, CardContent, CardFooter } from "@/src/components/ui/card"
import { useTasks } from "@/src/hooks/use-tasks"

interface LogData {
  tipoResiduo: string
  fecha: string
  area: string
  peso: number
}

// Simulated logged user data
const currentUser = {
  name: "Juan Pérez",
  area: "Planta 1",
  role: "Supervisor",
}

// Types of waste options
const tiposResiduo = ["Metálico", "Plástico", "Papel/Cartón", "Vidrio", "Orgánico", "Electrónico", "Químico", "Otro"]

// List of areas
const areas = ["Planta 1", "Planta 2", "Planta 3", "Planta 4", "Planta 5", "Planta 6", "Planta 7"]

export default function UploadLogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId")

  const { tasks, completeTask } = useTasks()
  const task = tasks.find((t) => t.id === taskId) || null

  const [formData, setFormData] = useState<LogData>({
    tipoResiduo: task?.wasteType || "",
    fecha: new Date().toISOString().split("T")[0],
    area: task?.area || currentUser.area,
    peso: 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData((prev) => ({
        ...prev,
        tipoResiduo: task.wasteType || prev.tipoResiduo,
        area: task.area || prev.area,
      }))
    }
  }, [task])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Submit the log data
    if (taskId && task) {
      completeTask(taskId, formData)
      setSuccessMessage("Registro completado con éxito")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } else {
      // Handle case where there's no task (direct page access)
      setSuccessMessage("Registro completado con éxito")
      setFormData({
        tipoResiduo: "",
        fecha: new Date().toISOString().split("T")[0],
        area: currentUser.area,
        peso: 0,
      })
      setIsSubmitting(false)
    }
  }

  return (

        <Card>

          <CardContent>
            <form id="log-form" onSubmit={handleSubmit} className="space-y-6">
              {task && (
                <div className=" p-4 rounded-md mb-6">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-foreground">{task.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tipoResiduo">Tipo de Residuo</Label>
                <Select
                  value={formData.tipoResiduo}
                  onValueChange={(value) => handleSelectChange("tipoResiduo", value)}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de residuo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposResiduo.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-zinc-500">Fecha preestablecida a hoy</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => handleSelectChange("area", value)}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500">
                  {task
                    ? "Área preestablecida según la tarea"
                    : `Área preestablecida según usuario: ${currentUser.name}`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  name="peso"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.peso || ""}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {successMessage && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md">
                  {successMessage}
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="log-form"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar"}
            </Button>
          </CardFooter>
        </Card>
  )
}
