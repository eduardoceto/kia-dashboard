"use client"

import { useState, useEffect, useCallback } from "react"
import { Edit, Plus, Search, Trash, Loader2 } from "lucide-react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { toast } from "sonner"
import type { SupabaseClient } from '@supabase/supabase-js' // Import SupabaseClient type
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/src/components/ui/alert-dialog"
import { useTranslations } from "next-intl"

// Define Driver type
type Driver = {
  id: string; // Assuming UUID from Supabase, or a specific driver ID column
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  origin: string | null;
  destination: string | null;
  vehicle_plates: string | null;
  economic_number: string | null; // Assuming snake_case in DB
  is_active: boolean;
};

interface DriverManagementProps {
  supabase: SupabaseClient; // Accept Supabase client as a prop
}

export default function DriverManagement({ supabase }: DriverManagementProps) {
  const t = useTranslations('permissionsPage.driverManagement')
  // Driver State
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(true)
  const [driverSearchTerm, setDriverSearchTerm] = useState("")
  const [newDriver, setNewDriver] = useState({
    // id is generated by Supabase or manually entered if not UUID
    first_name: "",
    last_name: "",
    company: "",
    origin: "",
    destination: "",
    vehicle_plates: "",
    economic_number: "",
    is_active: true,
  })
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false)
  const [isEditDriverDialogOpen, setIsEditDriverDialogOpen] = useState(false)
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [pendingDeleteDriver, setPendingDeleteDriver] = useState<Driver | null>(null);
  const [pendingToggleDriver, setPendingToggleDriver] = useState<{id: string, currentStatus: boolean, first_name: string, last_name: string} | null>(null);

  // --- Fetch Function ---
  const fetchDrivers = useCallback(async () => {
    setLoadingDrivers(true);
    // Adjust table and column names ('numero_economico') if different in your DB
    const { data, error } = await supabase
      .from('drivers') // Assuming your table is named 'drivers'
      .select('id, first_name, last_name, company, origin, destination, vehicle_plates, economic_number, is_active');

    if (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers.");
      setDrivers([]);
    } else {
       const formattedData = data?.map(drv => ({
        ...drv,
        first_name: drv.first_name ?? 'N/A',
        last_name: drv.last_name ?? 'N/A',
        full_name: `${drv.first_name} ${drv.last_name}`,
        company: drv.company ?? 'N/A',
        origin: drv.origin ?? 'N/A',
        destination: drv.destination ?? 'N/A',
        vehicle_plates: drv.vehicle_plates ?? 'N/A',
        economic_number: drv.economic_number ?? 'N/A',
        is_active: drv.is_active ?? false,
      })) || [];
      setDrivers(formattedData);
    }
    setLoadingDrivers(false);
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // --- Filtered Data ---
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.first_name?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.last_name?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.company?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.vehicle_plates?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.economic_number?.toLowerCase().includes(driverSearchTerm.toLowerCase()),
  );

  // --- Driver CRUD Operations ---

  const handleAddDriver = async () => {
    if (!newDriver.first_name || !newDriver.last_name || !newDriver.vehicle_plates || !newDriver.economic_number) {
        toast.error("Please fill in required driver fields (Nombre, Placas, Número Económico).");
        return;
    }
    setIsSubmittingDriver(true);

    try {
        const { error } = await supabase
            .from('drivers')
            .insert([
                {
                    first_name: newDriver.first_name,
                    last_name: newDriver.last_name,
                    compania: newDriver.company || null,
                    procedencia: newDriver.origin || null,
                    destino: newDriver.destination || null,
                    placas: newDriver.vehicle_plates,
                    numero_economico: newDriver.economic_number,
                    is_active: newDriver.is_active,
                },
            ]);

        if (error) throw error;

        toast.success("Driver added successfully!");
        setNewDriver({ first_name: "", last_name: "", company: "", origin: "", destination: "", vehicle_plates: "", economic_number: "", is_active: true });
        setIsAddDriverDialogOpen(false);
        fetchDrivers(); // Refresh the list
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error adding driver:", error);
        toast.error(`Failed to add driver: ${errMsg}`);
    } finally {
        setIsSubmittingDriver(false);
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver) return;
    setIsSubmittingDriver(true);

    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          first_name: editingDriver.first_name,
          last_name: editingDriver.last_name,
          company: editingDriver.company || null,
          origin: editingDriver.origin || null,
          destination: editingDriver.destination || null,
          vehicle_plates: editingDriver.vehicle_plates,
          economic_number: editingDriver.economic_number,
          is_active: editingDriver.is_active,
        })
        .eq('id', editingDriver.id);

      if (error) throw error;

      toast.success("Driver updated successfully!");
      setEditingDriver(null);
      setIsEditDriverDialogOpen(false);
      fetchDrivers(); // Refresh list
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error updating driver:", error);
      toast.error(`Failed to update driver: ${errMsg}`);
    } finally {
        setIsSubmittingDriver(false);
    }
  };

  // Deactivate (Soft Delete)
  const handleDeleteDriver = async (id: string) => {
      const driverToDeactivate = drivers.find(drv => drv.id === id);
      if (!driverToDeactivate || !driverToDeactivate.is_active) {
          toast.info("Driver is already inactive.");
          return;
      }
      setPendingDeleteDriver(driverToDeactivate);
  };

  const confirmDeleteDriver = async () => {
      if (!pendingDeleteDriver) return;
      setIsSubmittingDriver(true);
      try {
          const { error } = await supabase
              .from('drivers')
              .update({ is_active: false })
              .eq('id', pendingDeleteDriver.id);

          if (error) throw error;

          setDrivers(drivers.map((drv) => (drv.id === pendingDeleteDriver.id ? { ...drv, is_active: false } : drv)));
          toast.success("Driver deactivated successfully!");
      } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error("Error deactivating driver:", error);
          toast.error(`Failed to deactivate driver: ${errMsg}`);
      } finally {
          setIsSubmittingDriver(false);
          setPendingDeleteDriver(null);
      }
  };

  const handleToggleDriverActive = (id: string, currentStatus: boolean, first_name: string, last_name:string) => {
    setPendingToggleDriver({ id, currentStatus, first_name, last_name });
  };

  const confirmToggleDriverActive = async () => {
    if (!pendingToggleDriver) return;
    const { id, currentStatus } = pendingToggleDriver;
    const action = currentStatus ? "deactivate" : "activate";
    setIsSubmittingDriver(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Driver ${action}d successfully!`);
      setDrivers(drivers.map((drv) => (drv.id === id ? { ...drv, is_active: !currentStatus } : drv)));
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error toggling driver status (${action}):`, error);
      toast.error(`Failed to ${action} driver: ${errMsg}`);
    } finally {
      setIsSubmittingDriver(false);
      setPendingToggleDriver(null);
    }
  };

  // --- Render Logic ---
  return (
    <AccordionItem value="drivers">
      <AccordionTrigger className="text-lg font-semibold">{t('sectionTitle')}</AccordionTrigger>
      <AccordionContent>
        {/* Search and Add Button */}
         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-8"
              value={driverSearchTerm}
              onChange={(e) => setDriverSearchTerm(e.target.value)}
            />
          </div>
          {/* Add Driver Dialog */}
          <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                {t('addButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('addDialogTitle')}</DialogTitle>
                <DialogDescription>{t('addDialogDescription')}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="driver-first_name">{t('firstName')} *</Label><Input id="driver-first_name" value={newDriver.first_name} onChange={(e) => setNewDriver({ ...newDriver, first_name: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="grid gap-2"><Label htmlFor="driver-last_name">{t('lastName')} *</Label><Input id="driver-last_name" value={newDriver.last_name} onChange={(e) => setNewDriver({ ...newDriver, last_name: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="grid gap-2"><Label htmlFor="driver-company">{t('company')}</Label><Input id="driver-company" value={newDriver.company} onChange={(e) => setNewDriver({ ...newDriver, company: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="grid gap-2"><Label htmlFor="driver-origin">{t('origin')}</Label><Input id="driver-origin" value={newDriver.origin} onChange={(e) => setNewDriver({ ...newDriver, origin: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="grid gap-2"><Label htmlFor="driver-destination">{t('destination')}</Label><Input id="driver-destination" value={newDriver.destination} onChange={(e) => setNewDriver({ ...newDriver, destination: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="grid gap-2"><Label htmlFor="driver-vehicle_plates">{t('vehiclePlates')} *</Label><Input id="driver-vehicle_plates" value={newDriver.vehicle_plates} onChange={(e) => setNewDriver({ ...newDriver, vehicle_plates: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="grid gap-2"><Label htmlFor="driver-economic_number">{t('economicNumber')} *</Label><Input id="driver-economic_number" value={newDriver.economic_number} onChange={(e) => setNewDriver({ ...newDriver, economic_number: e.target.value })} disabled={isSubmittingDriver}/></div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch id="driver-active" checked={newDriver.is_active} onCheckedChange={(checked) => setNewDriver({ ...newDriver, is_active: checked })} disabled={isSubmittingDriver}/>
                  <Label htmlFor="driver-active">{t('active')}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDriverDialogOpen(false)} disabled={isSubmittingDriver}>{t('cancel')}</Button>
                <Button variant="default" onClick={handleAddDriver} disabled={isSubmittingDriver}>
                   {isSubmittingDriver ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isSubmittingDriver ? t('adding') : t('add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Driver Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.company')}</TableHead>
                <TableHead>{t('table.origin')}</TableHead>
                <TableHead>{t('table.destination')}</TableHead>
                <TableHead>{t('table.vehiclePlates')}</TableHead>
                <TableHead>{t('table.economicNumber')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
              {loadingDrivers ? (
                 <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
              ) : !filteredDrivers.length ? (
                 <TableRow><TableCell colSpan={8} className="h-24 text-center">{t('noDrivers')}</TableCell></TableRow>
              ) : (
                filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>{driver.first_name} {driver.last_name}</TableCell>
                    <TableCell>{driver.company}</TableCell>
                    <TableCell>{driver.origin}</TableCell>
                    <TableCell>{driver.destination}</TableCell>
                    <TableCell>{driver.vehicle_plates}</TableCell>
                    <TableCell>{driver.economic_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch id={`active-drv-${driver.id}`} checked={driver.is_active} onCheckedChange={() => handleToggleDriverActive(driver.id, driver.is_active, driver.first_name ?? '', driver.last_name || driver.vehicle_plates || driver.id)} />
                        <Label htmlFor={`active-drv-${driver.id}`} className="text-sm">{driver.is_active ? t('active') : t('status')}</Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {/* Edit Driver Dialog */}
                        <Dialog
                          open={isEditDriverDialogOpen && editingDriver?.id === driver.id}
                          onOpenChange={(isOpen) => {
                              if (!isOpen) setEditingDriver(null);
                              setIsEditDriverDialogOpen(isOpen);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingDriver(driver); setIsEditDriverDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {editingDriver && editingDriver.id === driver.id && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>{t('editDialogTitle')}</DialogTitle>
                                <DialogDescription>{t('editDialogDescription')}</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                              <div className="grid gap-2"><Label htmlFor="edit-driver-first-name">{t('firstName')}</Label><Input id="edit-driver-first-name" value={editingDriver.first_name ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, first_name: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-driver-last-name">{t('lastName')}</Label><Input id="edit-driver-last-name" value={editingDriver.last_name ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, last_name: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-driver-company">{t('company')}</Label><Input id="edit-driver-company" value={editingDriver.company ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, company: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-driver-origin">{t('origin')}</Label><Input id="edit-driver-origin" value={editingDriver.origin ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, origin: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-driver-destination">{t('destination')}</Label><Input id="edit-driver-destination" value={editingDriver.destination ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, destination: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-driver-vehicle_plates">{t('vehiclePlates')}</Label><Input id="edit-driver-vehicle_plates" value={editingDriver.vehicle_plates ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_plates: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-driver-economic_number">{t('economicNumber')}</Label><Input id="edit-driver-economic_number" value={editingDriver.economic_number ?? ''} onChange={(e) => setEditingDriver({ ...editingDriver, economic_number: e.target.value })} disabled={isSubmittingDriver}/></div>
                                <div className="flex items-center space-x-2 md:col-span-2"><Switch id="edit-driver-active" checked={editingDriver.is_active} onCheckedChange={(checked) => setEditingDriver({ ...editingDriver, is_active: checked })} disabled={isSubmittingDriver}/><Label htmlFor="edit-driver-active">{t('active')}</Label></div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDriverDialogOpen(false)} disabled={isSubmittingDriver}>{t('cancel')}</Button>
                                <Button onClick={handleEditDriver} disabled={isSubmittingDriver}>
                                  {isSubmittingDriver ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  {isSubmittingDriver ? t('saving') : t('save')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                        {/* Deactivate Driver Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDriver(driver.id)} className="text-destructive hover:text-destructive" disabled={isSubmittingDriver || !driver.is_active} title={driver.is_active ? t('deactivateTitle') : t('status')}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('deactivateTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('deactivateDescription', { name: `${pendingDeleteDriver?.first_name ?? ''} ${pendingDeleteDriver?.last_name ?? ''}`.trim() })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setPendingDeleteDriver(null)}>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDeleteDriver} disabled={isSubmittingDriver}>{t('deactivateConfirm')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <AlertDialog open={!!pendingToggleDriver} onOpenChange={(open) => { if (!open) setPendingToggleDriver(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('toggleTitle', { action: pendingToggleDriver?.currentStatus ? t('deactivate') : t('activate') })}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('toggleDescription', { action: pendingToggleDriver?.currentStatus ? t('deactivate') : t('activate'), name: `${pendingToggleDriver?.first_name ?? ''} ${pendingToggleDriver?.last_name ?? ''}`.trim() })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingToggleDriver(null)}>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmToggleDriverActive} disabled={isSubmittingDriver}>
                {pendingToggleDriver?.currentStatus ? t('deactivate') : t('activate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AccordionContent>
    </AccordionItem>
  )
}
