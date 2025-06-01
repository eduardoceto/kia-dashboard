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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('wasteDisposalForm');
  return (
    <FormField
      control={form.control}
      name="tipoMaterial"
      render={({ field }) => (
        <FormItem>
          <FormLabel><h1>{t('materialTypeLabel')}</h1><p className='text-xs text-neutral-500'>{t('materialTypeDescription')}</p></FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectMaterialPlaceholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {[
                { value: 'lodos', label: t('materialTypes.lodos') },
                { value: 'metal', label: t('materialTypes.metal') },
                { value: 'otros', label: t('materialTypes.otros') },
                { value: 'destruidas', label: t('materialTypes.destruidas') },
              ].map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
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
