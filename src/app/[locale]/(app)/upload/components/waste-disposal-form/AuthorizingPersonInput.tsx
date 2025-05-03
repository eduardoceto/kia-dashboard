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

interface AuthorizingPersonInputProps {
  form: UseFormReturn<WasteDisposalFormValues>;
}

export default function AuthorizingPersonInput({
  form,
}: AuthorizingPersonInputProps) {
  return (
    <FormField
      control={form.control}
      name="personaAutoriza"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Persona que Autoriza</FormLabel>
          <FormControl>
            <Input placeholder="Nombre completo" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
