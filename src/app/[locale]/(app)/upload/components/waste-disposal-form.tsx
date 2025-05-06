"use client";
import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form"; // Import UseFormReturn
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { generatePdf } from '@/src/actions/generatePdf';
import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import { Card, CardContent } from "@/src/components/ui/card";
import { createClient } from "@/src/utils/supabase/client";
import { submitWasteDisposal } from "@/src/actions/submitWasteDisposal";

// Import new sub-components
import AutomaticInfo from './waste-disposal-form/AutomaticInfo';
import DriverInfo, { Driver } from './waste-disposal-form/DriverInfo'; // Assuming Driver interface is moved or exported
import MaterialTypeSelection, { materialTypes } from './waste-disposal-form/MaterialTypeSelection'; // Assuming constants are moved/exported
import WasteDetailsSection, { metalUnits } from './waste-disposal-form/WasteDetailsSection'; // Assuming constants are moved/exported
import ContainerSelection, { containerTypes } from './waste-disposal-form/ContainerSelection'; // Assuming constants are moved/exported
import AuthorizingPersonInput from './waste-disposal-form/AuthorizingPersonInput';
import DownloadConfirmationDialog from './waste-disposal-form/DownloadConfirmationDialog';

// Keep Driver interface here or move to a shared types file if used elsewhere
// export interface Driver { ... }

// Keep constants here or move them to their respective components / shared file
// export const materialTypes = [ ... ];
// export const containerTypes = [ ... ];
// export const metalUnits = [ ... ];

// --- Form Schema Definition --- (Keep in the main component or move to a separate schema file)
const formSchema = z.object({
  nombreChofer: z.string().min(2, { message: "El nombre del chofer es requerido" }),
  compania: z.string().min(2, { message: "La compañía es requerida" }),
  procedencia: z.string().min(2, { message: "La procedencia es requerida" }),
  destino: z.string().min(2, { message: "El destino es requerido" }),
  placas: z.string().min(2, { message: "Las placas son requeridas" }),
  numeroEconomico: z.string().min(2, { message: "El número económico es requerido" }),
  tipoMaterial: z.string().min(1, { message: "Seleccione un tipo de material" }),
  tipoContenedor: z.string().min(1, { message: "Seleccione un tipo de contenedor" }),
  personaAutoriza: z.string().min(2, { message: "El nombre de quien autoriza es requerido" }),

  // Lodos fields (optional)
  lodos_nombreResiduo: z.string().optional(),
  lodos_manifiestoNo: z.string().optional(),
  lodos_area: z.string().optional(),
  lodos_transporteNoServicios: z.string().optional(),
  lodos_pesoKg: z.string().optional(),

  // Metal/no Metal fields (optional)
  metal_tipoResiduo: z.string().optional(),
  metal_item: z.string().optional(),
  metal_cantidad: z.string().optional(),
  metal_unidad: z.string().optional(),
  metal_remisionHMMX: z.string().optional(),
  metal_remisionKia: z.string().optional(),

  // Otros Reciclables fields (optional)
  otros_tipoDesecho: z.string().optional(),
  otros_item: z.string().optional(),
  otros_cantidad: z.string().optional(),
  otros_unidad: z.string().optional(),
  otros_remisionHMMX: z.string().optional(),
  otros_remisionKia: z.string().optional(),

  // Uretano/Vidrio/Autopartes Destruidas fields (optional)
  destruidas_residuos: z.string().optional(),
  destruidas_area: z.string().optional(),
  destruidas_peso: z.string().optional(), // Using string for input

}).superRefine((data, ctx) => {
  // Keep superRefine logic here as it depends on the whole data object
  if (data.tipoMaterial === "lodos") {
    if (!data.lodos_nombreResiduo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre de residuo es requerido para Lodos", path: ["lodos_nombreResiduo"] });
    if (!data.lodos_manifiestoNo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Manifiesto No. es requerido para Lodos", path: ["lodos_manifiestoNo"] });
    if (!data.lodos_area?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Área es requerida para Lodos", path: ["lodos_area"] });
    if (!data.lodos_transporteNoServicios?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transporte No. de Servicios es requerido para Lodos", path: ["lodos_transporteNoServicios"] });
    const peso = parseFloat(data.lodos_pesoKg || "");
    if (isNaN(peso) || peso <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Peso (kg) es requerido y debe ser un número mayor a 0 para Lodos", path: ["lodos_pesoKg"] });
  } else if (data.tipoMaterial === "metal") {
    if (!data.metal_tipoResiduo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de residuo es requerido para Metal/no Metal", path: ["metal_tipoResiduo"] });
    if (!data.metal_item?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Item es requerido para Metal/no Metal", path: ["metal_item"] });
    const cantidad = parseFloat(data.metal_cantidad || "");
    if (isNaN(cantidad) || cantidad <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cantidad es requerida y debe ser un número mayor a 0 para Metal/no Metal", path: ["metal_cantidad"] });
    if (!data.metal_unidad) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Unidad es requerida para Metal/no Metal", path: ["metal_unidad"] });
    if (!data.metal_remisionHMMX?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remisión HMMX es requerida para Metal/no Metal", path: ["metal_remisionHMMX"] });
    if (!data.metal_remisionKia?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remisión Kia es requerida para Metal/no Metal", path: ["metal_remisionKia"] });
  } else if (data.tipoMaterial === "otros") {
    if (!data.otros_tipoDesecho?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de desecho es requerido para Otros Reciclables", path: ["otros_tipoDesecho"] });
    if (!data.otros_item?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Item es requerido para Otros Reciclables", path: ["otros_item"] });
    const cantidad = parseFloat(data.otros_cantidad || "");
    if (isNaN(cantidad) || cantidad <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cantidad es requerida y debe ser un número mayor a 0 para Otros Reciclables", path: ["otros_cantidad"] });
    if (!data.otros_unidad) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Unidad es requerida para Otros Reciclables", path: ["otros_unidad"] });
    if (!data.otros_remisionHMMX?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remisión HMMX es requerida para Otros Reciclables", path: ["otros_remisionHMMX"] });
    if (!data.otros_remisionKia?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remisión Kia es requerida para Otros Reciclables", path: ["otros_remisionKia"] });
  } else if (data.tipoMaterial === "destruidas") {
    if (!data.destruidas_residuos?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Residuos es requerido para Uretano/Vidrio/Autopartes", path: ["destruidas_residuos"] });
    if (!data.destruidas_area?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Área es requerida para Uretano/Vidrio/Autopartes", path: ["destruidas_area"] });
    const peso = parseFloat(data.destruidas_peso || "");
    if (isNaN(peso) || peso <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Peso es requerido y debe ser un número mayor a 0 para Uretano/Vidrio/Autopartes", path: ["destruidas_peso"] });
  }
});
// --- End Form Schema Definition ---

// Define the type for the form values based on the schema
export type WasteDisposalFormValues = z.infer<typeof formSchema>;

export default function WasteDisposalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [driverError, setDriverError] = useState<string | null>(null);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);

  const supabase = createClient();

  // Fetch Drivers Effect
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoadingDrivers(true);
      setDriverError(null);
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("id, first_name, last_name, company, origin, destination, vehicle_plates, economic_number");

        if (error) throw error;
        if (data) setDrivers(data as Driver[]);

      } catch (error: any) {
        console.error("Error fetching drivers:", error);
        setDriverError(`Error al cargar los choferes: ${error?.message || 'Detalles no disponibles'}. Intente de nuevo.`);
      } finally {
        setIsLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, [supabase]);

  // Auto-generated values
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const currentTime = format(new Date(), "HH:mm");
  const generatedNumber = Math.floor(10000 + Math.random() * 90000).toString();

  // Form Hook
  const form = useForm<WasteDisposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreChofer: "",
      compania: "",
      procedencia: "",
      destino: "",
      placas: "",
      numeroEconomico: "",
      tipoMaterial: "",
      tipoContenedor: "",
      personaAutoriza: "",
      // Initialize all optional fields
      lodos_nombreResiduo: "",
      lodos_manifiestoNo: "",
      lodos_area: "",
      lodos_transporteNoServicios: "",
      lodos_pesoKg: "",
      metal_tipoResiduo: "",
      metal_item: "",
      metal_cantidad: "",
      metal_unidad: "",
      metal_remisionHMMX: "",
      metal_remisionKia: "",
      otros_tipoDesecho: "",
      otros_item: "",
      otros_cantidad: "",
      otros_unidad: "",
      otros_remisionHMMX: "",
      otros_remisionKia: "",
      destruidas_residuos: "",
      destruidas_area: "",
      destruidas_peso: "",
    },
  });

  const selectedMaterialType = form.watch("tipoMaterial");

  // Driver Selection Handler
  const handleDriverSelect = (currentValue: string) => {
    const driverId = currentValue === selectedDriverId ? "" : currentValue;
    setSelectedDriverId(driverId);
    const selectedDriver = drivers.find((driver) => driver.id === driverId);

    if (selectedDriver) {
      form.setValue("nombreChofer", selectedDriver.first_name + " " + selectedDriver.last_name);
      form.setValue("compania", selectedDriver.company);
      form.setValue("procedencia", selectedDriver.origin);
      form.setValue("destino", selectedDriver.destination);
      form.setValue("placas", selectedDriver.vehicle_plates);
      form.setValue("numeroEconomico", selectedDriver.economic_number);
    } else {
      // Reset fields if driver is deselected
      form.resetField("nombreChofer");
      form.resetField("compania");
      form.resetField("procedencia");
      form.resetField("destino");
      form.resetField("placas");
      form.resetField("numeroEconomico");
    }
    // Consider closing popover if applicable (logic might move to DriverInfo)
    // setDriverPopoverOpen(false);
  };

  // Import the generatePdf function

  // Form Submission Handler
  async function onSubmit(values: WasteDisposalFormValues) {
    setIsSubmitting(true);
    try {
      let wasteDetails: any = {};
      let totalWeight: string | number = 0;

      // Calculate wasteDetails and totalWeight based on tipoMaterial
      if (values.tipoMaterial === "lodos") {
        wasteDetails = {
          nombreResiduo: values.lodos_nombreResiduo,
          manifiestoNo: values.lodos_manifiestoNo,
          area: values.lodos_area,
          transporteNoServicios: values.lodos_transporteNoServicios,
          pesoKg: parseFloat(values.lodos_pesoKg || "0"),
        };
        totalWeight = wasteDetails.pesoKg;
      } else if (values.tipoMaterial === "metal") {
        wasteDetails = {
          tipoResiduo: values.metal_tipoResiduo,
          item: values.metal_item,
          cantidad: parseFloat(values.metal_cantidad || "0"),
          unidad: values.metal_unidad,
          remisionHMMX: values.metal_remisionHMMX,
          remisionKia: values.metal_remisionKia,
        };
        totalWeight = values.metal_unidad === 'kg' ? wasteDetails.cantidad : 0;
      } else if (values.tipoMaterial === "otros") {
        wasteDetails = {
          tipoDesecho: values.otros_tipoDesecho,
          item: values.otros_item,
          cantidad: parseFloat(values.otros_cantidad || "0"),
          unidad: values.otros_unidad,
          remisionHMMX: values.otros_remisionHMMX,
          remisionKia: values.otros_remisionKia,
        };
        totalWeight = values.otros_unidad === 'kg' ? wasteDetails.cantidad : 0;
      } else if (values.tipoMaterial === "destruidas") {
        wasteDetails = {
          residuos: values.destruidas_residuos,
          area: values.destruidas_area,
          peso: parseFloat(values.destruidas_peso || "0"),
        };
        totalWeight = wasteDetails.peso;
      }

      const formData = {
        // Map form values to the structure expected by submitWasteDisposal
        nombreChofer: values.nombreChofer,
        compania: values.compania,
        procedencia: values.procedencia,
        destino: values.destino,
        placas: values.placas,
        numeroEconomico: values.numeroEconomico,
        tipoMaterial: values.tipoMaterial,
        tipoContenedor: values.tipoContenedor,
        personaAutoriza: values.personaAutoriza,
        fecha: currentDate,
        horaSalida: currentTime,
        folio: generatedNumber,
        departamento: "EHS",
        motivo: "residuos",
        residuos: wasteDetails,
        pesoTotal: (typeof totalWeight === 'number' ? totalWeight : parseFloat(totalWeight || "0")).toFixed(2),
      };

      console.log("Submitting Form Data:", formData);
      await submitWasteDisposal(formData);

      setSubmitSuccess(true);
      setPdfData(formData); // Store data for PDF
      setShowDownloadAlert(true); // Show download prompt
      form.reset(); // Reset form fields
      setSelectedDriverId(""); // Reset driver selection

    } catch (error) {
      console.error("Error submitting form:", error);
      // Consider adding user-facing error feedback here
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle PDF Download Confirmation
  const handleDownloadConfirm = () => {
    if (pdfData) {
      generatePdf(pdfData);
    }
    setShowDownloadAlert(false);
  };

  const handleDownloadCancel = () => {
    setShowDownloadAlert(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        {submitSuccess ? (
          // Success Message View
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-800 font-medium">Registro guardado exitosamente</p>
            <Button variant="outline"className="mt-4" onClick={() => setSubmitSuccess(false)}>
              Crear nuevo registro
            </Button>
          </div>
        ) : (
          // Form View
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Render new sub-components */}
              <AutomaticInfo
                currentDate={currentDate}
                currentTime={currentTime}
                generatedNumber={generatedNumber}
              />

              <DriverInfo
                form={form as UseFormReturn<WasteDisposalFormValues>} // Pass form object
                drivers={drivers}
                isLoadingDrivers={isLoadingDrivers}
                driverError={driverError}
                selectedDriverId={selectedDriverId}
                onDriverSelect={handleDriverSelect}
              />

              <MaterialTypeSelection form={form as UseFormReturn<WasteDisposalFormValues>} />

              <WasteDetailsSection
                form={form as UseFormReturn<WasteDisposalFormValues>}
                selectedMaterialType={selectedMaterialType}
              />

              <ContainerSelection form={form as UseFormReturn<WasteDisposalFormValues>} />

              <AuthorizingPersonInput form={form as UseFormReturn<WasteDisposalFormValues>} />

              {/* Submit Button */}
              <Button type="submit" variant="outline" disabled={isSubmitting || isLoadingDrivers}>
                {isSubmitting ? "Guardando..." : "Guardar Registro"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>

      {/* Download Confirmation Dialog (using the new component) */}
      <DownloadConfirmationDialog
        open={showDownloadAlert}
        onConfirm={handleDownloadConfirm}
        onCancel={handleDownloadCancel}
      />
    </Card>
  );
}