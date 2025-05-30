"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { WasteDisposalFormValues } from "../waste-disposal-form";
import { useTranslations } from "next-intl";

interface AuthorizingPersonInputProps {
  form: UseFormReturn<WasteDisposalFormValues>;
}

export default function AuthorizingPersonInput({
  form,
}: AuthorizingPersonInputProps) {
  const t = useTranslations('wasteDisposalForm');
  return (
    <FormField
      control={form.control}
      name="personaAutoriza"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('authorizingPersonLabel')}</FormLabel>
          <FormControl>
            <Input placeholder={t('authorizingPersonPlaceholder')} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
