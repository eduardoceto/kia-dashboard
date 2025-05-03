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
import { WasteDisposalFormValues } from "../waste-disposal-form";

// Define container types locally or import from a shared constants file
export const containerTypes = [
  { value: "compactadora", label: "Compactadora" },
  { value: "contenedor", label: "Contenedor" },
  { value: "pipa", label: "Pipa" },
  { value: "plataforma", label: "Plataforma" },
  { value: "caja_seca", label: "Caja Seca" },
  { value: "otro", label: "Otro" },
];

interface ContainerSelectionProps {
  form: UseFormReturn<WasteDisposalFormValues>;
}

export default function ContainerSelection({ form }: ContainerSelectionProps) {
  return (
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
  );
}
