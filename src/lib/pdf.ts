import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, WORK_MODES, type WorkMode } from './presetTypes';

export interface PdfMaterialRow { item: string; quantity: string; price: number; total: number; }

export interface PdfQuoteInput {
  quoteNumber: string;
  date: string;
  presetName: string;
  companyName?: string;
  client: { name: string; phone: string; location?: string };
  project: { area: number; workMode: WorkMode; styleName: string; patternName: string; multiplier: number; baseRate: number; rate: number; total: number };
  casting?: PdfMaterialRow[];
  grinding?: PdfMaterialRow[];
  materialsTotal?: number;
  notes?: string;
}

const PRIMARY: [number, number, number] = [37, 99, 235]; // blue-600
const SLATE: [number, number, number] = [15, 23, 42];

export const generateQuotationPdf = (input: PdfQuoteInput): jsPDF => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const modeName = WORK_MODES.find(m => m.id === input.project.workMode)?.name ?? input.project.workMode;

  // Header banner
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pw, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(input.companyName || 'TERRAZZO QUOTATION', 14, 14);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Professional terrazzo flooring quotation', 14, 20);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(input.quoteNumber, pw - 14, 14, { align: 'right' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(input.date, pw - 14, 20, { align: 'right' });

  doc.setTextColor(...SLATE);
  let y = 42;

  // Client + Project two-column block
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRIMARY);
  doc.text('BILL TO', 14, y);
  doc.text('PROJECT', pw / 2, y);
  doc.setTextColor(...SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  y += 5;
  doc.setFont('helvetica', 'bold'); doc.text(input.client.name, 14, y);
  doc.setFont('helvetica', 'bold'); doc.text(`Area: ${input.project.area.toFixed(2)} m²`, pw / 2, y);
  y += 5; doc.setFont('helvetica', 'normal');
  doc.text(input.client.phone, 14, y);
  doc.text(`Mode: ${modeName}`, pw / 2, y);
  y += 5;
  if (input.client.location) doc.text(input.client.location, 14, y);
  doc.text(`Style: ${input.project.styleName}`, pw / 2, y);
  y += 5;
  doc.text(`Preset: ${input.presetName}`, 14, y);
  doc.text(`Pattern: ${input.project.patternName}`, pw / 2, y);
  y += 8;

  // Cost breakdown
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount']],
    body: [
      [`Base rate (${input.project.styleName})`, `${formatCurrency(input.project.baseRate)} / m²`],
      [`Pattern multiplier (${input.project.patternName})`, `× ${input.project.multiplier.toFixed(2)}`],
      [`Adjusted rate per m²`, `${formatCurrency(input.project.rate)} / m²`],
      [`Project area`, `${input.project.area.toFixed(2)} m²`],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 1: { halign: 'right' } },
  });
  y = (doc as any).lastAutoTable.finalY + 2;

  // Grand total bar
  doc.setFillColor(...PRIMARY);
  doc.rect(14, y, pw - 28, 12, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL', 18, y + 8);
  doc.text(formatCurrency(input.project.total), pw - 18, y + 8, { align: 'right' });
  doc.setTextColor(...SLATE);
  y += 18;

  const addTable = (title: string, rows: PdfMaterialRow[]) => {
    if (!rows?.length) return;
    if (y > ph - 60) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRIMARY);
    doc.text(title, 14, y);
    doc.setTextColor(...SLATE);
    autoTable(doc, {
      startY: y + 2,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: rows.map(r => [r.item, r.quantity, formatCurrency(r.price), formatCurrency(r.total)]),
      foot: [['Subtotal', '', '', formatCurrency(rows.reduce((s, r) => s + r.total, 0))]],
      theme: 'striped',
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      footStyles: { fillColor: [226, 232, 240], textColor: SLATE, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  };

  addTable('CASTING PHASE MATERIALS', input.casting ?? []);
  addTable('GRINDING PHASE MATERIALS', input.grinding ?? []);

  if (input.materialsTotal != null && (input.casting?.length || input.grinding?.length)) {
    if (y > ph - 25) { doc.addPage(); y = 20; }
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, pw - 28, 10, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('MATERIALS GRAND TOTAL', 18, y + 7);
    doc.text(formatCurrency(input.materialsTotal), pw - 18, y + 7, { align: 'right' });
    y += 16;
  }

  // Terms
  if (y > ph - 40) { doc.addPage(); y = 20; }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRIMARY);
  doc.text('TERMS & CONDITIONS', 14, y);
  doc.setTextColor(...SLATE); doc.setFont('helvetica', 'normal');
  y += 5;
  const terms = [
    '• Quotation valid for 14 days from date above.',
    '• 50% deposit required to commence work; balance on completion.',
    '• Prices assume site is accessible, subfloor is level and structurally sound.',
    '• Any additional works are quoted separately.',
    input.notes || '',
  ].filter(Boolean);
  terms.forEach(t => { doc.text(t, 14, y); y += 5; });

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`${input.quoteNumber}  •  Page ${i} of ${total}`, pw / 2, ph - 8, { align: 'center' });
  }

  return doc;
};
