"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { WasteDisposalFormValues } from "../waste-disposal-form";

// Define units locally or import from a shared constants file
export const metalUnits = [
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "pza", label: "Piezas (pza)" },
];

interface WasteDetailsSectionProps {
  form: UseFormReturn<WasteDisposalFormValues>;
  selectedMaterialType: string;
}

const WasteDetailsSection: React.FC<WasteDetailsSectionProps> = ({ form, selectedMaterialType }) => {
  if (!selectedMaterialType) return null; // Don't render if no material type is selected

  return (
    <div className="border rounded-md p-4 space-y-4 mt-4">
      <h3 className="text-lg font-medium mb-2">Detalles del Material</h3>

      {/* --- Conditional Waste Fields --- */}
      {selectedMaterialType === "lodos" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="lodos_nombreResiduo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Residuo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Lodos de pintura" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lodos_manifiestoNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manifiesto No.</FormLabel>
                <FormControl>
                  <Input placeholder="Número de manifiesto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lodos_area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área</FormLabel>
                <FormControl>
                  <Input placeholder="Área de origen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lodos_transporteNoServicios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transporte No. de Servicios</FormLabel>
                <FormControl>
                  <Input placeholder="Número de servicio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lodos_pesoKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Peso en kilogramos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {selectedMaterialType === "metal" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="metal_tipoResiduo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Residuo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Acero, Aluminio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metal_item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción del item" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metal_cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Cantidad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metal_unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {metalUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
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
            name="metal_remisionHMMX"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remisión HMMX</FormLabel>
                <FormControl>
                  <Input placeholder="Número de remisión HMMX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metal_remisionKia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remisión Kia</FormLabel>
                <FormControl>
                  <Input placeholder="Número de remisión Kia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {selectedMaterialType === "otros" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="otros_tipoDesecho"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Desecho</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Cartón, Plástico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otros_item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción del item" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otros_cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Cantidad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otros_unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {metalUnits.map((unit) => ( // Reusing metalUnits, consider renaming if needed
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
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
            name="otros_remisionHMMX"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remisión HMMX</FormLabel>
                <FormControl>
                  <Input placeholder="Número de remisión HMMX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otros_remisionKia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remisión Kia</FormLabel>
                <FormControl>
                  <Input placeholder="Número de remisión Kia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {selectedMaterialType === "destruidas" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="destruidas_residuos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residuos</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Uretano, Vidrio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destruidas_area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área</FormLabel>
                <FormControl>
                  <Input placeholder="Área de origen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destruidas_peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Peso en kilogramos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default WasteDetailsSection;
