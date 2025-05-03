"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { WasteDisposalFormValues } from "../waste-disposal-form"; // Import the main form values type

// Define Driver interface locally or import from a shared types file
export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  origin: string;
  destination: string;
  vehicle_plates: string;
  economic_number: string; // Ensure this matches the Supabase column name
}

interface DriverInfoProps {
  form: UseFormReturn<WasteDisposalFormValues>;
  drivers: Driver[];
  isLoadingDrivers: boolean;
  driverError: string | null;
  selectedDriverId: string;
  onDriverSelect: (value: string) => void;
}

export default function DriverInfo({
  form,
  drivers,
  isLoadingDrivers,
  driverError,
  selectedDriverId,
  onDriverSelect,
}: DriverInfoProps) {
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h3 className="text-lg font-medium mb-2">Información del Chofer</h3>

      {/* Driver Selection Combobox */}
      <Popover open={driverPopoverOpen} onOpenChange={setDriverPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={driverPopoverOpen}
            className="w-full justify-between"
            disabled={isLoadingDrivers || !!driverError}
          >
            {isLoadingDrivers
              ? "Cargando choferes..."
              : driverError
              ? "Error al cargar"
              : selectedDriverId
              ? drivers.find((driver) => driver.id === selectedDriverId)?.first_name
                ? `${drivers.find((driver) => driver.id === selectedDriverId)?.first_name} ${drivers.find((driver) => driver.id === selectedDriverId)?.last_name}`
                : "Seleccionar Chofer..."
              : "Seleccionar Chofer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
          <Command>
            <CommandInput placeholder="Buscar chofer..." />
            <CommandList>
              <CommandEmpty>No se encontró el chofer.</CommandEmpty>
              <CommandGroup>
                {drivers.map((driver) => (
                    <CommandItem
                    key={driver.id}
                    // Combine first name, last name, and company for searching
                    value={`${driver.first_name} ${driver.last_name} ${driver.company}`}
                    onSelect={() => { // Use driver.id directly in onSelect
                      onDriverSelect(driver.id); // Pass ID to handler
                      setDriverPopoverOpen(false);
                    }}
                    >
                    <Check
                      className={cn(
                      "mr-2 h-4 w-4",
                      selectedDriverId === driver.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {driver.first_name} {driver.last_name} ({driver.company})
                    </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {driverError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{driverError}</AlertDescription>
        </Alert>
      )}

      {/* Driver Detail Fields (Read-only, populated by selection) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nombreChofer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Chofer</FormLabel>
              <FormControl>
                <Input {...field} readOnly  />
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
                <Input {...field} readOnly  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="procedencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procedencia</FormLabel>
              <FormControl>
                <Input {...field} readOnly  />
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
                <Input {...field} readOnly  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placas</FormLabel>
              <FormControl>
                <Input {...field} readOnly  />
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
                <Input {...field} readOnly  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
