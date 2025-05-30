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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('wasteDisposalForm');
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
          <AlertDialogTitle>{t('downloadDialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('downloadDialogDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction className='bg-foreground hover:text-foreground hover:border ' onClick={onConfirm}>
            {t('download')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DownloadConfirmationDialog;
