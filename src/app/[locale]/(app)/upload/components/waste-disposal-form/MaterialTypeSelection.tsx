"use client";

import React from 'react';
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

// Define material types locally or import from a shared constants file
export const materialTypes = [
  { value: "lodos", label: "Lodos" },
  { value: "metal", label: "Metal / no Metal" },
  { value: "otros", label: "Otros Reciclables" },
  {
    value: "destruidas",
    label: "Uretano / Vidrio / Autopartes Destruidas",
  },
];

interface MaterialTypeSelectionProps {
  form: UseFormReturn<WasteDisposalFormValues>;
}

const MaterialTypeSelection: React.FC<MaterialTypeSelectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="tipoMaterial"
      render={({ field }) => (
        <FormItem>
          <FormLabel><h1>Tipo de Material</h1><p className='text-xs text-neutral-500'>Dependiendo del Registro</p></FormLabel>
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
  );
};

export default MaterialTypeSelection;
