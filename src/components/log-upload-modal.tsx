"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

interface LogData {
  tipoResiduo: string
  fecha: string
  area: string
  peso: number
}

interface Task {
  id: string
  title: string
  description: string
  wasteType: string
  area: string
}

interface LogUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LogData) => void
  task: Task | null
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

export function LogUploadModal({ isOpen, onClose, onSubmit, task }: LogUploadModalProps) {
  const [formData, setFormData] = useState<LogData>({
    tipoResiduo: task?.wasteType || "",
    fecha: new Date().toISOString().split("T")[0],
    area: task?.area || currentUser.area,
    peso: 0,
  })

  // Update form data when task changes
  React.useEffect(() => {
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
    onSubmit(formData)
    setFormData({
      tipoResiduo: "",
      fecha: new Date().toISOString().split("T")[0],
      area: currentUser.area,
      peso: 0,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" sm:max-w-md bg-popover">
        <DialogHeader>
          <DialogTitle>Registro de Residuos</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {task && (
            <div className=" p-3 rounded-md mb-4">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-zinc-600">{task.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tipoResiduo">Tipo de Residuo</Label>
            <Select
              value={formData.tipoResiduo}
              onValueChange={(value) => handleSelectChange("tipoResiduo", value)}
              required
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
              className=""
            />
            <p className="text-xs ">Fecha preestablecida a hoy</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <Select value={formData.area} onValueChange={(value) => handleSelectChange("area", value)} required>
              <SelectTrigger className="">
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
            <p className="text-xs ">Área preestablecida según la tarea</p>
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
              className=""
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className=""
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
