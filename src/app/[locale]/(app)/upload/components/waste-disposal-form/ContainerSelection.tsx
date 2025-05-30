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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('wasteDisposalForm');
  return (
    <FormField
      control={form.control}
      name="tipoContenedor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('containerTypeLabel')}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectContainerPlaceholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(t.raw('containerTypes')).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label as string}
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
