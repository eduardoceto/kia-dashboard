import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LogEntry } from '@/src/utils/log/log-utils';

export function generatePdf(data: LogEntry) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- HEADER ---
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('KIA', 18, 22);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MOP9-F13 AUTORIZACIÓN PARA SALIDA DE MATERIALES', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(200, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`FOLIO: ${data.folio}`, pageWidth - 18, 22, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Divider after header
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.7);
  doc.line(15, 38, pageWidth - 15, 38);

  let y = 42;

  // --- SOLICITANTE SECTION (Table) ---
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 1.5 },
    columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 55 }, 2: { cellWidth: 32 }, 3: { cellWidth: 55 } },
    body: [
      ['Fecha:', data.fecha, 'Hora de salida:', data.horaSalida],
      ['Nombre:', data.nombreChofer, 'Compañía:', data.compania],
      ['Procedencia:', data.procedencia, 'Destino:', data.destino],
      ['Departamento:', data.departamento, 'Motivo:', data.motivo],
    ],
  });
  // @ts-expect-error Needed for jsPDF plugin type mismatch
  y = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : y) + 16;

  // Divider after solicitante table
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(15, y - 8, pageWidth - 15, y - 8);

  // --- MATERIAL SECTION ---
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo de material:', 18, y);
  const materialTypes = [
    'Materia Prima', 'Maquinaria', 'Herramientas', 'Refacciones', 'Residuos No Peligrosos'
  ];
  let x = 40;
  let rowY = y + 12;
  const margin = 15;
  const minGap = 8;
  doc.setFont('helvetica', 'normal');
  materialTypes.forEach((type) => {
    const optionWidth = 2 + minGap + doc.getTextWidth(type);
    if (x + optionWidth > pageWidth - margin) {
      rowY += 20;
      x = 40;
    }
    doc.setDrawColor(160);
    doc.circle(x, rowY - 3, 2);
    if (type === data.tipoMaterial) {
      doc.setFillColor(0, 0, 0);
      doc.circle(x, rowY - 3, 2, 'F');
    }
    doc.text(type, x + 2 + minGap, rowY);
    x += optionWidth + minGap;
  });
  y = rowY + 20;

  // Divider after material section
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(15, y - 10, pageWidth - 15, y - 10);

  // --- DESCRIPCIÓN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('DESCRIPCIÓN', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  let descripcion = '';
  let cantidad = '';
  if (data.tipoMaterial === 'lodos' && data.residuos && 'nombreResiduo' in data.residuos) {
    descripcion = data.residuos.nombreResiduo || '';
    if ('pesoKg' in data.residuos && data.residuos.pesoKg) {
      cantidad = `Cantidad: ${data.residuos.pesoKg} kg`;
    }
  } else if ((data.tipoMaterial === 'metal' || data.tipoMaterial === 'otros') && data.residuos && 'item' in data.residuos) {
    descripcion = data.residuos.item || '';
    if ('cantidad' in data.residuos && data.residuos.cantidad) {
      cantidad = `Cantidad: ${data.residuos.cantidad} kg`;
    }
  } else if (data.tipoMaterial === 'destruidas' && data.residuos && 'residuos' in data.residuos) {
    descripcion = data.residuos.residuos || '';
    if ('peso' in data.residuos && data.residuos.peso) {
      cantidad = `Cantidad: ${data.residuos.peso} kg`;
    }
  }
  doc.text(descripcion, 18, y + 10);
  let descEndY = y + 10;
  if (cantidad) {
    doc.text(cantidad, 18, y + 18);
    descEndY = y + 18;
  }
  // Draw divider after both lines, with extra space
  const dividerY = descEndY + 10;
  y = dividerY + 2;

  // Divider after descripción
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(15, dividerY, pageWidth - 15, dividerY);
  y = dividerY + 8;

  // --- CONTENEDOR SECTION ---
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo de contenedor:', 18, y);
  y += 4;
  const containerTypes = [
    'Caja seca', 'Contenedor', 'Contenedor Abierto', 'Plataforma', 'Jaulas', 'Pickup', 'Camión 3.5'
  ];
  x = 40;
  rowY = y + 12;
  doc.setFont('helvetica', 'normal');
  containerTypes.forEach((type) => {
    const optionWidth = 2 + minGap + doc.getTextWidth(type);
    if (x + optionWidth > pageWidth - margin) {
      rowY += 20;
      x = 40;
    }
    doc.setDrawColor(160);
    doc.circle(x, rowY - 3, 2);
    if (type === data.tipoContenedor) {
      doc.setFillColor(0, 0, 0);
      doc.circle(x, rowY - 3, 2, 'F');
    }
    doc.text(type, x + 2 + minGap, rowY);
    x += optionWidth + minGap;
  });
  y = rowY + 22;

  // Divider after contenedor section
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(15, y - 10, pageWidth - 15, y - 10);

  // --- PLACAS & NÚMERO ECONÓMICO ---
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 1.5 },
    columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 55 }, 2: { cellWidth: 40 }, 3: { cellWidth: 40 } },
    body: [
      ['Placas:', data.placas, 'Número económico:', data.numeroEconomico],
    ],
  });
  // @ts-expect-error Needed for jsPDF plugin type mismatch
  y = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : y) + 40;

  // Divider before signature
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.7);
  doc.line(15, y - 22, pageWidth - 15, y - 22);

  // --- SIGNATURE ---
  doc.setFont('times', 'italic');
  doc.setFontSize(22);
  doc.text(String(data.personaAutoriza), pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Nombre y firma de autorizante KIA', pageWidth / 2, y + 7, { align: 'center' });

  doc.save(`autorizacion_salida_${data.folio}.pdf`);
}