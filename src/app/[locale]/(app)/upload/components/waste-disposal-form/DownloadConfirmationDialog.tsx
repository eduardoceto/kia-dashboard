// /Users/eduardo/Library/CloudStorage/OneDrive-Personal/Programacion/Clases/DesarrolloWeb/Dashboard/kia-dashboard/src/app/[locale]/(app)/upload/components/waste-disposal-form/DownloadConfirmationDialog.tsx
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"; // Adjust path if needed

interface DownloadConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DownloadConfirmationDialog: React.FC<DownloadConfirmationDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  // Prevent closing the dialog by clicking outside or pressing Escape
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onCancel(); // Call cancel if the dialog is forced closed
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Descarga</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Quieres descargar el archivo PDF del registro?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className='bg-foreground hover:text-foreground hover:border ' onClick={onConfirm}>
            Descargar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DownloadConfirmationDialog;
