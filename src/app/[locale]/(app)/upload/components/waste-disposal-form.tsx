"use client";
import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form"; // Import UseFormReturn
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { generatePdf } from '@/src/actions/generatePdf';
import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import { createClient } from "@/src/utils/supabase/client";
import { submitWasteDisposal } from "@/src/actions/submitWasteDisposal";
import type { ResiduoDetails } from "@/src/utils/log/log-utils";
import { useUser } from "@/src/hooks/useUser";
import { useTranslations } from "next-intl";

// Import new sub-components
import AutomaticInfo from './waste-disposal-form/AutomaticInfo';
import DriverInfo, { Driver } from './waste-disposal-form/DriverInfo'; // Assuming Driver interface is moved or exported
import MaterialTypeSelection from './waste-disposal-form/MaterialTypeSelection';
import WasteDetailsSection from './waste-disposal-form/WasteDetailsSection';
import ContainerSelection from './waste-disposal-form/ContainerSelection';
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

  // Otros Reciclables fields (optional)
  otros_tipoDesecho: z.string().optional(),
  otros_item: z.string().optional(),
  otros_cantidad: z.string().optional(),
  otros_unidad: z.string().optional(),
  otros_remisionHMMX: z.string().optional(),

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
  } else if (data.tipoMaterial === "otros") {
    if (!data.otros_tipoDesecho?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de desecho es requerido para Otros Reciclables", path: ["otros_tipoDesecho"] });
    if (!data.otros_item?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Item es requerido para Otros Reciclables", path: ["otros_item"] });
    const cantidad = parseFloat(data.otros_cantidad || "");
    if (isNaN(cantidad) || cantidad <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cantidad es requerida y debe ser un número mayor a 0 para Otros Reciclables", path: ["otros_cantidad"] });
    if (!data.otros_unidad) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Unidad es requerida para Otros Reciclables", path: ["otros_unidad"] });
    if (!data.otros_remisionHMMX?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remisión HMMX es requerida para Otros Reciclables", path: ["otros_remisionHMMX"] });
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

// New: Define the type for the full log entry (for PDF and submission)
export type WasteDisposalLogEntry = WasteDisposalFormValues & {
  fecha: string;
  horaSalida: string;
  folio: string;
  departamento: string;
  motivo: string;
  residuos: ResiduoDetails;
  pesoTotal: string;
};

// Add this type above the component:
export type WasteDisposalDbLog = {
  user_id: string;
  driver_id: string;
  date: string;
  departure_time: string;
  folio: string;
  department: string;
  reason: string;
  container_type: string;
  authorizing_person: string;
  quantity: number | null;
  quantity_type: string | null;
  waste_type: string | null;
  waste_name: string | null;
  area: string | null;
  transport_num_services: number | null;
  "Manifiesto No."?: string | null;
  excel_id?: number;
  REM?: number;
};

export default function WasteDisposalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [driverError, setDriverError] = useState<string | null>(null);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [pdfData, setPdfData] = useState<WasteDisposalLogEntry | null>(null);

  const supabase = createClient();
  const { profile } = useUser();
  const t = useTranslations('wasteDisposalForm');

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

      } catch (error: unknown) {
        console.error("Error fetching drivers:", error);
        setDriverError(`Error al cargar los choferes: ${error instanceof Error ? error.message : 'Detalles no disponibles'}. Intente de nuevo.`);
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
      otros_tipoDesecho: "",
      otros_item: "",
      otros_cantidad: "",
      otros_unidad: "",
      otros_remisionHMMX: "",
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
      // Use string IDs (UUIDs)
      const userId = String(profile?.id);
      const driverId = String(selectedDriverId);

      if (!userId || !driverId) {
        alert("User or driver not selected.");
        setIsSubmitting(false);
        return;
      }

      // Build the log object for DB submission (new waste_logs schema)
      const log: WasteDisposalDbLog = {
        user_id: userId,
        driver_id: driverId,
        date: currentDate,
        departure_time: currentTime,
        folio: generatedNumber,
        department: "EHS",
        reason: "Residuos",
        container_type: values.tipoContenedor,
        authorizing_person: values.personaAutoriza,
        quantity: null,
        quantity_type: null,
        waste_type: null,
        waste_name: null,
        area: null,
        transport_num_services: null,
        "Manifiesto No.": null,
      };

      // Set excel_id based on tipoMaterial
      let excelId: number | undefined;
      switch (values.tipoMaterial) {
        case "lodos":
          excelId = 1;
          break;
        case "destruidas":
          excelId = 2;
          break;
        case "otros":
          excelId = 3;
          break;
        case "metal":
          excelId = 4;
          break;
        default:
          excelId = undefined;
      }
      log.excel_id = excelId;

      if (values.tipoMaterial === "lodos") {
        log.quantity = parseFloat(values.lodos_pesoKg || "0") || 0;
        log.quantity_type = "kg";
        log.waste_name = values.lodos_nombreResiduo ?? null;
        log.area = values.lodos_area ?? null;
        log.transport_num_services = values.lodos_transporteNoServicios ? Number(values.lodos_transporteNoServicios) : null;
        log["Manifiesto No."] = values.lodos_manifiestoNo ?? null;
      } else if (values.tipoMaterial === "metal") {
        log.quantity = parseFloat(values.metal_cantidad || "0") || 0;
        log.quantity_type = values.metal_unidad ?? null;
        log.waste_type = values.metal_tipoResiduo ?? null;
        log.waste_name = values.metal_item ?? null;
        if (values.metal_remisionHMMX && !isNaN(Number(values.metal_remisionHMMX))) {
          log.REM = Number(values.metal_remisionHMMX);
        }
      } else if (values.tipoMaterial === "otros") {
        log.quantity = parseFloat(values.otros_cantidad || "0") || 0;
        log.quantity_type = values.otros_unidad ?? null;
        log.waste_type = values.otros_tipoDesecho ?? null;
        log.waste_name = values.otros_item ?? null;
        if (values.otros_remisionHMMX && !isNaN(Number(values.otros_remisionHMMX))) {
          log.REM = Number(values.otros_remisionHMMX);
        }
      } else if (values.tipoMaterial === "destruidas") {
        log.quantity = parseFloat(values.destruidas_peso || "0") || 0;
        log.quantity_type = "kg";
        log.waste_name = values.destruidas_residuos ?? null;
        log.area = values.destruidas_area ?? null;
      }

      await submitWasteDisposal(log);

      setSubmitSuccess(true);

      // Build the PDF data from the form values (not the log object)
      let residuos: ResiduoDetails = {};
      if (values.tipoMaterial === "lodos") {
        residuos = {
          nombreResiduo: values.lodos_nombreResiduo,
          manifiestoNo: values.lodos_manifiestoNo,
          area: values.lodos_area,
          transporteNoServicios: values.lodos_transporteNoServicios,
          pesoKg: values.lodos_pesoKg ? parseFloat(values.lodos_pesoKg) : undefined,
        };
      } else if (values.tipoMaterial === "metal") {
        residuos = {
          tipoResiduo: values.metal_tipoResiduo,
          item: values.metal_item,
          cantidad: values.metal_cantidad ? parseFloat(values.metal_cantidad) : undefined,
          unidad: values.metal_unidad,
          remisionHMMX: values.metal_remisionHMMX,
        };
      } else if (values.tipoMaterial === "otros") {
        residuos = {
          tipoDesecho: values.otros_tipoDesecho,
          item: values.otros_item,
          cantidad: values.otros_cantidad ? parseFloat(values.otros_cantidad) : undefined,
          unidad: values.otros_unidad,
          remisionHMMX: values.otros_remisionHMMX,
        };
      } else if (values.tipoMaterial === "destruidas") {
        residuos = {
          residuos: values.destruidas_residuos,
          area: values.destruidas_area,
          peso: values.destruidas_peso ? parseFloat(values.destruidas_peso) : undefined,
        };
      }
      const pdfData: WasteDisposalLogEntry = {
        ...values,
        fecha: currentDate,
        horaSalida: currentTime,
        folio: generatedNumber,
        departamento: "EHS",
        motivo: "Residuos",
        residuos,
        pesoTotal: log.quantity?.toFixed ? log.quantity.toFixed(2) : String(log.quantity),
      };
      setPdfData(pdfData);

      setShowDownloadAlert(true);
      form.reset();
      setSelectedDriverId("");
    } catch (error) {
      console.error("Error submitting form:", error);
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
    <div className="w-full sticky top-0">

        {submitSuccess ? (
          // Success Message View
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-800 font-medium">{t('successMessage')}</p>
            <Button variant="outline"className="mt-4" onClick={() => setSubmitSuccess(false)}>
              {t('newRecordButton')}
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
                {isSubmitting ? t('saving') : t('saveButton')}
              </Button>
            </form>
          </Form>
        )}

      {/* Download Confirmation Dialog (using the new component) */}
      <DownloadConfirmationDialog
        open={showDownloadAlert}
        onConfirm={handleDownloadConfirm}
        onCancel={handleDownloadCancel}
      />
    </div>
  );
}