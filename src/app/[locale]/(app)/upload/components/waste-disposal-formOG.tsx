"use client"

import { useState, useEffect } from "react" // Added useEffect
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { submitWasteDisposal } from "@/src/actions/submitWasteDisposal"
import { Card, CardContent } from "@/src/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/src/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { cn } from "@/lib/utils"
import { createClient } from "@/src/utils/supabase/client" // Import Supabase client

// Define the type for a driver based on your Supabase table structure
interface Driver {
  id: string
  nombre: string // Changed from name
  compania: string // Changed from company
  procedencia: string // Changed from origin
  destino: string // Changed from destination
  placas: string // Changed from plates
  numero_economico: string // Changed from numeroEconomico (snake_case)
  // Add other relevant fields if necessary
}

// Sample waste items with name, weight, and timestamp (for sorting by newest)
const wasteItems = [
  {
    id: "w1",
    name: "Cartón contaminado",
    weight: "15.5",
    timestamp: new Date("2025-04-15T10:30:00"),
  },
  {
    id: "w2",
    name: "Plástico PET",
    weight: "8.2",
    timestamp: new Date("2025-04-15T11:45:00"),
  },
  {
    id: "w3",
    name: "Residuos orgánicos",
    weight: "22.7",
    timestamp: new Date("2025-04-15T09:15:00"),
  },
  {
    id: "w4",
    name: "Metal contaminado",
    weight: "12.3",
    timestamp: new Date("2025-04-15T14:20:00"),
  },
  {
    id: "w5",
    name: "Vidrio roto",
    weight: "9.8",
    timestamp: new Date("2025-04-15T13:10:00"),
  },
  {
    id: "w6",
    name: "Aceite usado",
    weight: "18.5",
    timestamp: new Date("2025-04-15T15:30:00"),
  },
  {
    id: "w7",
    name: "Baterías",
    weight: "5.2",
    timestamp: new Date("2025-04-15T16:45:00"),
  },
  {
    id: "w8",
    name: "Lámparas fluorescentes",
    weight: "3.7",
    timestamp: new Date("2025-04-15T17:15:00"),
  },
]

// Sort waste items by timestamp (newest first)
const sortedWasteItems = [...wasteItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

const materialTypes = [
  { value: "metal", label: "Metal/no Metal" },
  { value: "destruidas", label: "Uretano/Vidrio/Autopartes Destruidas" },
  { value: "lodos", label: "Lodos" },
  { value: "otros", label: "Otros Reciclables" },
]

const containerTypes = [
  { value: "cajaSeca", label: "Caja Seca" },
  { value: "contenedor", label: "Contenedor" },
  { value: "contenedorAbierto", label: "Contenedor Abierto" },
  { value: "plataforma", label: "Plataforma" },
  { value: "jaulas", label: "Jaulas" },
  { value: "pickup", label: "PickUp" },
  { value: "camion3.5", label: "Camion 3.5" },
]

// Updated schema to use waste item IDs instead of manual entries
const formSchema = z.object({
  nombreChofer: z.string().min(2, { message: "El nombre del chofer es requerido" }),
  compania: z.string().min(2, { message: "La compañía es requerida" }),
  procedencia: z.string().min(2, { message: "La procedencia es requerida" }),
  destino: z.string().min(2, { message: "El destino es requerido" }),
  placas: z.string().min(2, { message: "Las placas son requeridas" }),
  numeroEconomico: z.string().min(2, { message: "El número económico es requerido" }),
  tipoMaterial: z.string().min(1, { message: "Seleccione un tipo de material" }),
  residuosSeleccionados: z.array(z.string()).min(1, { message: "Seleccione al menos un residuo" }),
  tipoContenedor: z.string().min(1, { message: "Seleccione un tipo de contenedor" }),
  personaAutoriza: z.string().min(2, { message: "El nombre de quien autoriza es requerido" }),
})

export default function WasteDisposalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [selectedWasteItems, setSelectedWasteItems] = useState<string[]>([])
  const [wasteCommandOpen, setWasteCommandOpen] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([]) // State for drivers
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true) // Loading state
  const [driverError, setDriverError] = useState<string | null>(null) // Error state

  const supabase = createClient() // Initialize Supabase client

  // Fetch drivers from Supabase on component mount
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoadingDrivers(true)
      setDriverError(null)
      try {
        // Adjust 'drivers' to your actual table name and column names if different
        const { data, error } = await supabase
          .from("drivers") // Replace 'drivers' with your actual table name
          // Select necessary columns using actual database names
          .select("id, nombre, compania, procedencia, destino, placas, numero_economico")

        if (error) {
          // Throw the specific Supabase error for better context
          throw error
        }

        if (data) {
          // Ensure the fetched data matches the Driver interface
          setDrivers(data as Driver[])
        }
      } catch (error: any) {
        // Log the full error object for more details
        console.error("Error fetching drivers:", error)
        // Optionally, try stringifying if the object is complex or doesn't log well
        // console.error("Error fetching drivers (stringified):", JSON.stringify(error, null, 2));
        setDriverError(`Error al cargar los choferes: ${error?.message || 'Detalles no disponibles'}. Intente de nuevo.`)
      } finally {
        setIsLoadingDrivers(false)
      }
    }

    fetchDrivers()
  }, [supabase]) // Dependency array includes supabase client instance

  // Generate automatic values
  const currentDate = format(new Date(), "yyyy-MM-dd")
  const currentTime = format(new Date(), "HH:mm")
  const generatedNumber = Math.floor(10000 + Math.random() * 90000).toString()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreChofer: "",
      compania: "",
      procedencia: "",
      destino: "",
      placas: "",
      numeroEconomico: "",
      tipoMaterial: "",
      residuosSeleccionados: [],
      tipoContenedor: "",
      personaAutoriza: "",
    },
  })

  // Handle driver selection and autofill (uses the 'drivers' state)
  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId)
    // Find driver from the state variable 'drivers'
    const selectedDriver = drivers.find((driver) => driver.id === driverId)

    if (selectedDriver) {
      // Use correct property names from the Driver interface
      form.setValue("nombreChofer", selectedDriver.nombre)
      form.setValue("compania", selectedDriver.compania)
      form.setValue("procedencia", selectedDriver.procedencia)
      form.setValue("destino", selectedDriver.destino)
      form.setValue("placas", selectedDriver.placas)
      form.setValue("numeroEconomico", selectedDriver.numero_economico) // Use snake_case here
    } else {
      // Optionally clear fields if driver not found (e.g., if selection is cleared)
      form.resetField("nombreChofer")
      form.resetField("compania")
      form.resetField("procedencia")
      form.resetField("destino")
      form.resetField("placas")
      form.resetField("numeroEconomico")
    }
  }

  // Handle waste item selection
  const handleWasteItemSelect = (itemId: string) => {
    const currentItems = form.getValues("residuosSeleccionados")

    // Check if item is already selected
    if (currentItems.includes(itemId)) {
      // Remove item if already selected
      const updatedItems = currentItems.filter((id) => id !== itemId)
      form.setValue("residuosSeleccionados", updatedItems)
      setSelectedWasteItems(updatedItems)
    } else {
      // Add item if not already selected
      const updatedItems = [...currentItems, itemId]
      form.setValue("residuosSeleccionados", updatedItems)
      setSelectedWasteItems(updatedItems)
    }
  }

  // Handle waste item removal
  const handleWasteItemRemove = (itemId: string) => {
    const updatedItems = selectedWasteItems.filter((id) => id !== itemId)
    form.setValue("residuosSeleccionados", updatedItems)
    setSelectedWasteItems(updatedItems)
  }

  // Calculate total weight of selected waste items
  const calculateTotalWeight = () => {
    return selectedWasteItems
      .map((id) => wasteItems.find((item) => item.id === id)?.weight || "0")
      .reduce((sum, weight) => sum + Number.parseFloat(weight), 0)
      .toFixed(2)
  }

  // Get waste item details by ID
  const getWasteItemById = (id: string) => {
    return wasteItems.find((item) => item.id === id)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Get full waste item details for selected IDs
      const selectedWastes = values.residuosSeleccionados.map((id) => {
        const item = wasteItems.find((w) => w.id === id)
        return {
          id,
          nombreResiduo: item?.name || "",
          peso: item?.weight || "0",
        }
      })

      // Calculate total weight
      const totalWeight = calculateTotalWeight()

      // Add automatic fields to the form data
      const formData = {
        ...values,
        fecha: currentDate,
        horaSalida: currentTime,
        folio: generatedNumber,
        departamento: "EHS",
        motivo: "residuos",
        residuos: selectedWastes,
        pesoTotal: totalWeight,
      }

      await submitWasteDisposal(formData)
      setSubmitSuccess(true)
      form.reset()
      setSelectedDriverId("")
      setSelectedWasteItems([])
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        {submitSuccess ? (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-800 font-medium">Registro guardado exitosamente</p>
            <Button className="mt-4" onClick={() => setSubmitSuccess(false)}>
              Crear nuevo registro
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Automatic fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input value={currentDate} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora de Salida</label>
                  <Input value={currentTime} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Folio</label>
                  <Input value={generatedNumber} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fixed fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Departamento</label>
                  <Input value="EHS" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Motivo</label>
                  <Input value="Residuos" disabled />
                </div>
              </div>

              {/* Driver selection dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Seleccionar Chofer</label>
                <Select
                  value={selectedDriverId}
                  onValueChange={handleDriverChange}
                  disabled={isLoadingDrivers || !!driverError} // Disable while loading or if error
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingDrivers
                          ? "Cargando choferes..."
                          : driverError
                            ? "Error al cargar"
                            : "Seleccionar chofer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDrivers ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : driverError ? (
                      <SelectItem value="error" disabled>
                        {driverError}
                      </SelectItem>
                    ) : drivers.length === 0 ? (
                      <SelectItem value="no-drivers" disabled>
                        No hay choferes disponibles
                      </SelectItem>
                    ) : (
                      drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.nombre} - {driver.compania}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {driverError && <p className="text-sm text-red-600 mt-1">{driverError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User input fields */}
                <FormField
                  control={form.control}
                  name="nombreChofer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Chofer</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del chofer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compania"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compañía</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la compañía" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="procedencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Lugar de procedencia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino</FormLabel>
                      <FormControl>
                        <Input placeholder="Lugar de destino" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="placas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placas</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de placas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroEconomico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Económico</FormLabel>
                      <FormControl>
                        <Input placeholder="Número económico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tipoMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><h1>Tipo de Material</h1><p className="text-xs text-muted-foreground/60">Dependiendo del formulario</p></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materialTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Waste selection with Command component */}
              <FormField
                control={form.control}
                name="residuosSeleccionados"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Residuos</FormLabel>
                    <Popover open={wasteCommandOpen} onOpenChange={setWasteCommandOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={wasteCommandOpen}
                            className="justify-between w-full"
                          >
                            {selectedWasteItems.length > 0
                              ? `${selectedWasteItems.length} residuo(s) seleccionado(s)`
                              : "Seleccionar residuos"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-full min-w-[300px]">
                        <Command>
                          <CommandInput placeholder="Buscar residuo..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron residuos.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-y-auto">
                              {sortedWasteItems.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.id}
                                  onSelect={() => handleWasteItemSelect(item.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedWasteItems.includes(item.id) ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="flex-1">{item.name}</span>
                                  <span className="text-sm text-muted-foreground">{item.weight} kg</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display selected waste items */}
              {selectedWasteItems.length > 0 && (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Residuos Seleccionados</h3>
                  <div className="space-y-2">
                    {selectedWasteItems.map((itemId) => {
                      const item = getWasteItemById(itemId)
                      return (
                        <div key={itemId} className="flex items-center justify-between p-2 rounded-md">
                          <span>{item?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{item?.weight} kg</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWasteItemRemove(itemId)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Display total weight */}
                  <div className="flex justify-end">
                    <div className="p-2 rounded-md">
                      <span className="font-medium">Peso Total: </span>
                      {calculateTotalWeight()} kg
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="tipoContenedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contenedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de contenedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {containerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personaAutoriza"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona que Autoriza</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de quien autoriza" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="outline" disabled={isSubmitting || isLoadingDrivers}>
                {isSubmitting ? "Guardando..." : "Guardar Registro"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
