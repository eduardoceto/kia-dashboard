"use client";

import React from 'react';
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useTranslations } from "next-intl";

interface AutomaticInfoProps {
  currentDate: string;
  currentTime: string;
  generatedNumber: string;
}

const AutomaticInfo: React.FC<AutomaticInfoProps> = ({
  currentDate,
  currentTime,
  generatedNumber,
}) => {
  const t = useTranslations('wasteDisposalForm');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4">
      <div>
        <Label htmlFor="fecha">{t('dateLabel')}</Label>
        <Input id="fecha" value={currentDate} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="horaSalida">{t('timeLabel')}</Label>
        <Input id="horaSalida" value={currentTime} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="folio">{t('folioLabel')}</Label>
        <Input id="folio" value={generatedNumber} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="departamento">{t('departmentLabel')}</Label>
        <Input id="departamento" value={t('fixedValues.department')} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="motivo">{t('reasonLabel')}</Label>
        <Input id="motivo" value={t('fixedValues.reason')} readOnly className="mt-1 bg-gray-100" />
      </div>
    </div>
  );
};

export default AutomaticInfo;
