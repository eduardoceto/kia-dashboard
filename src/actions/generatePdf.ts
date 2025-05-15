import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LogEntry, ResiduoDetails, LodosResiduo, MetalResiduo, OtrosResiduo, DestruidasResiduo } from '@/src/utils/log/log-utils';

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
    const residuos = data.residuos as ResiduoDetails;
    if (data.tipoMaterial === 'lodos' && 'nombreResiduo' in residuos) {
      const lodos = residuos as LodosResiduo;
      tableRows.push(['Nombre del Residuo', lodos.nombreResiduo || '']);
      tableRows.push(['Manifiesto No.', lodos.manifiestoNo || '']);
      tableRows.push(['Área', lodos.area || '']);
      tableRows.push(['Transporte No. Servicios', lodos.transporteNoServicios || '']);
      tableRows.push(['Peso (kg)', lodos.pesoKg || '']);
    } else if (data.tipoMaterial === 'metal' && 'tipoResiduo' in residuos) {
      const metal = residuos as MetalResiduo;
      tableRows.push(['Tipo de Residuo', metal.tipoResiduo || '']);
      tableRows.push(['Item', metal.item || '']);
      tableRows.push(['Cantidad', metal.cantidad || '']);
      tableRows.push(['Unidad', metal.unidad || '']);
      tableRows.push(['Remisión HMMX', metal.remisionHMMX || '']);
      tableRows.push(['Remisión Kia', metal.remisionKia || '']);
    } else if (data.tipoMaterial === 'otros' && 'tipoDesecho' in residuos) {
      const otros = residuos as OtrosResiduo;
      tableRows.push(['Tipo de Desecho', otros.tipoDesecho || '']);
      tableRows.push(['Item', otros.item || '']);
      tableRows.push(['Cantidad', otros.cantidad || '']);
      tableRows.push(['Unidad', otros.unidad || '']);
      tableRows.push(['Remisión HMMX', otros.remisionHMMX || '']);
      tableRows.push(['Remisión Kia', otros.remisionKia || '']);
    } else if (data.tipoMaterial === 'destruidas' && 'residuos' in residuos) {
      const destruidas = residuos as DestruidasResiduo;
      tableRows.push(['Residuos', destruidas.residuos || '']);
      tableRows.push(['Área', destruidas.area || '']);
      tableRows.push(['Peso', destruidas.peso || '']);
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
  const finalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 200;
  doc.setFontSize(10);
  
  const signatureY = finalY + 30;
  doc.line(20, signatureY, 80, signatureY); // Signature line 1
  doc.line(120, signatureY, 180, signatureY); // Signature line 2
  
  doc.text('Firma de Autorización', 30, signatureY + 10);
  doc.text('Firma de Seguridad', 135, signatureY + 10);

  // Save the PDF
  doc.save(`autorizacion_salida_${data.folio}.pdf`);
}