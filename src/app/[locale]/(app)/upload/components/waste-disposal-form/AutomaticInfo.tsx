"use client";

import React from 'react';
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4">
      <div>
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" value={currentDate} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="horaSalida">Hora Salida</Label>
        <Input id="horaSalida" value={currentTime} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="folio">Folio</Label>
        <Input id="folio" value={generatedNumber} readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="departamento">Departamento</Label>
        <Input id="departamento" value="EHS" readOnly className="mt-1 bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="motivo">Motivo</Label>
        <Input id="motivo" value="Residuos" readOnly className="mt-1 bg-gray-100" />
      </div>
    </div>
  );
};

export default AutomaticInfo;
