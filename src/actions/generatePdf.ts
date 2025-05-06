import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LogEntry } from '@/src/utils/log/log-utils';

export function generatePdf(data: LogEntry) {
  const doc = new jsPDF();

  // Add KIA logo and title
  doc.setFontSize(20);
  doc.text('KIA', 14, 20);
  doc.setFontSize(14);
  doc.text('AUTORIZACIÓN PARA SALIDA DE MATERIALES', 14, 30);

  // Add form information
  const tableColumn = ['Campo', 'Valor'];
  const tableRows: (string | number)[][] = [];

  // Add general info
  tableRows.push(['Folio', data.folio]);
  tableRows.push(['Fecha', data.fecha]);
  tableRows.push(['Hora de Salida', data.horaSalida]);
  tableRows.push(['Departamento', data.departamento]);
  tableRows.push(['Motivo', data.motivo]);
  tableRows.push(['Nombre del Chofer', data.nombreChofer]);
  tableRows.push(['Compañía', data.compania]);
  tableRows.push(['Procedencia', data.procedencia]);
  tableRows.push(['Destino', data.destino]);
  tableRows.push(['Placas', data.placas]);
  tableRows.push(['Número Económico', data.numeroEconomico]);
  tableRows.push(['Tipo de Material', data.tipoMaterial]);
  tableRows.push(['Tipo de Contenedor', data.tipoContenedor]);
  tableRows.push(['Persona que Autoriza', data.personaAutoriza]);
  tableRows.push(['Peso Total (kg)', data.pesoTotal]);

  // Add waste-specific details based on material type
  if (data.residuos) {
    tableRows.push(['-- Detalles del Material --', '']);
    
    if (data.tipoMaterial === 'lodos') {
      const residuos = data.residuos as any;
      tableRows.push(['Nombre del Residuo', residuos.nombreResiduo || '']);
      tableRows.push(['Manifiesto No.', residuos.manifiestoNo || '']);
      tableRows.push(['Área', residuos.area || '']);
      tableRows.push(['Transporte No. Servicios', residuos.transporteNoServicios || '']);
      tableRows.push(['Peso (kg)', residuos.pesoKg || '']);
    } 
    else if (data.tipoMaterial === 'metal') {
      const residuos = data.residuos as any;
      tableRows.push(['Tipo de Residuo', residuos.tipoResiduo || '']);
      tableRows.push(['Item', residuos.item || '']);
      tableRows.push(['Cantidad', residuos.cantidad || '']);
      tableRows.push(['Unidad', residuos.unidad || '']);
      tableRows.push(['Remisión HMMX', residuos.remisionHMMX || '']);
      tableRows.push(['Remisión Kia', residuos.remisionKia || '']);
    } 
    else if (data.tipoMaterial === 'otros') {
      const residuos = data.residuos as any;
      tableRows.push(['Tipo de Desecho', residuos.tipoDesecho || '']);
      tableRows.push(['Item', residuos.item || '']);
      tableRows.push(['Cantidad', residuos.cantidad || '']);
      tableRows.push(['Unidad', residuos.unidad || '']);
      tableRows.push(['Remisión HMMX', residuos.remisionHMMX || '']);
      tableRows.push(['Remisión Kia', residuos.remisionKia || '']);
    } 
    else if (data.tipoMaterial === 'destruidas') {
      const residuos = data.residuos as any;
      tableRows.push(['Residuos', residuos.residuos || '']);
      tableRows.push(['Área', residuos.area || '']);
      tableRows.push(['Peso', residuos.peso || '']);
    }
  }

  // Add the table to the document
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 'auto' }
    }
  });

  // Add signature lines at the bottom
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  doc.setFontSize(10);
  
  const signatureY = finalY + 30;
  doc.line(20, signatureY, 80, signatureY); // Signature line 1
  doc.line(120, signatureY, 180, signatureY); // Signature line 2
  
  doc.text('Firma de Autorización', 30, signatureY + 10);
  doc.text('Firma de Seguridad', 135, signatureY + 10);

  // Save the PDF
  doc.save(`autorizacion_salida_${data.folio}.pdf`);
}