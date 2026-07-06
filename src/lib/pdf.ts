import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, WORK_MODES, type WorkMode } from './presetTypes';

export interface PdfMaterialRow { item: string; quantity: string; price: number; total: number; }

export interface PdfSectionedFloor {
  area_m2: number;
  thickness_mm?: number | null;
  colour?: string | null;
  styleName?: string;
  patternName?: string;
  items: PdfMaterialRow[];
  subtotal: number;
}
export interface PdfSectionedSkirting {
  area_m2: number;
  height_mm?: number | null;
  wall_length_m?: number | null;
  colour?: string | null;
  styleName?: string;
  patternName?: string;
  items: PdfMaterialRow[];
  subtotal: number;
}
export interface PdfSectioned {
  floor: PdfSectionedFloor;
  skirting: PdfSectionedSkirting | null;
  grindingItems: PdfMaterialRow[];
  castingMaterials: number;
  grindingMaterials: number;
  materialsTotal: number;
  labourCost: number;
  transport: number;
  profit: number;
  profitPct: number;
  grandTotal: number;
  modeName: string;
}

export interface PdfQuoteInput {
  quoteNumber: string;
  date: string;
  presetName: string;
  companyName?: string;
  client: { name: string; phone: string; location?: string };
  project: { area: number; workMode: WorkMode; styleName: string; patternName: string; multiplier: number; baseRate: number; rate: number; total: number };
  /** Legacy flat lists — used only when `sectioned` is absent (backward compat). */
  casting?: PdfMaterialRow[];
  grinding?: PdfMaterialRow[];
  materialsTotal?: number;
  /** Preferred structured payload. When provided, the new layout is rendered. */
  sectioned?: PdfSectioned;
  notes?: string;
}

const PRIMARY: [number, number, number] = [37, 99, 235];
const SLATE: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [226, 232, 240];

const ensureRoom = (doc: jsPDF, y: number, needed: number): number => {
  const ph = doc.internal.pageSize.getHeight();
  if (y + needed > ph - 15) { doc.addPage(); return 20; }
  return y;
};

const drawHeader = (doc: jsPDF, input: PdfQuoteInput) => {
  const pw = doc.internal.pageSize.getWidth();
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
};

const sectionHeading = (doc: jsPDF, y: number, title: string): number => {
  const pw = doc.internal.pageSize.getWidth();
  y = ensureRoom(doc, y, 10);
  doc.setFillColor(...PRIMARY);
  doc.rect(14, y, pw - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 17, y + 5);
  doc.setTextColor(...SLATE);
  return y + 10;
};

const drawMixTable = (doc: jsPDF, y: number, rows: PdfMaterialRow[], subtotalLabel: string, subtotal: number): number => {
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: rows.length
      ? rows.map(r => [r.item, r.quantity, formatCurrency(r.price), formatCurrency(r.total)])
      : [[{ content: 'No items.', colSpan: 4, styles: { halign: 'center', textColor: 120, fontStyle: 'italic' } } as any]],
    foot: [[{ content: subtotalLabel, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(subtotal)]],
    theme: 'striped',
    headStyles: { fillColor: PRIMARY, textColor: 255, fontSize: 9 },
    footStyles: { fillColor: MUTED, textColor: SLATE, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  return (doc as any).lastAutoTable.finalY + 6;
};

export const generateQuotationPdf = (input: PdfQuoteInput): jsPDF => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const modeName = input.sectioned?.modeName
    ?? WORK_MODES.find(m => m.id === input.project.workMode)?.name ?? input.project.workMode;

  drawHeader(doc, input);
  let y = 40;

  // ================= PROJECT INFORMATION =================
  y = sectionHeading(doc, y, 'Project Information');
  autoTable(doc, {
    startY: y,
    body: [
      [{ content: 'Client', styles: { fontStyle: 'bold' } }, input.client.name,
       { content: 'Area', styles: { fontStyle: 'bold' } }, `${input.project.area.toFixed(2)} m²`],
      [{ content: 'Phone', styles: { fontStyle: 'bold' } }, input.client.phone,
       { content: 'Mode', styles: { fontStyle: 'bold' } }, modeName],
      [{ content: 'Location', styles: { fontStyle: 'bold' } }, input.client.location || '—',
       { content: 'Style', styles: { fontStyle: 'bold' } }, input.project.styleName],
      [{ content: 'Preset', styles: { fontStyle: 'bold' } }, input.presetName,
       { content: 'Pattern', styles: { fontStyle: 'bold' } }, input.project.patternName],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 22, fillColor: [245, 247, 250] },
      1: { cellWidth: (pw - 28 - 44) / 2 },
      2: { cellWidth: 22, fillColor: [245, 247, 250] },
      3: { cellWidth: (pw - 28 - 44) / 2 },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  const S = input.sectioned;

  // ================= COST SUMMARY =================
  y = sectionHeading(doc, y, 'Cost Summary');
  const castingMat = S?.castingMaterials ?? 0;
  const grindingMat = S?.grindingMaterials ?? (input.materialsTotal ?? 0) - castingMat;
  const materialsTotal = S?.materialsTotal ?? input.materialsTotal ?? (castingMat + grindingMat);
  const labourCost = S?.labourCost ?? 0;
  const transport = S?.transport ?? 0;
  const profit = S?.profit ?? 0;
  const profitPct = S?.profitPct ?? 0;
  const grand = S?.grandTotal ?? input.project.total;

  autoTable(doc, {
    startY: y,
    body: [
      ['Casting materials', formatCurrency(castingMat)],
      ['Grinding materials', formatCurrency(grindingMat)],
      [{ content: 'Total materials cost', styles: { fontStyle: 'bold' } }, { content: formatCurrency(materialsTotal), styles: { fontStyle: 'bold' } }],
      ['Labour cost', formatCurrency(labourCost)],
      ['Transport', formatCurrency(transport)],
      [`Profit (${profitPct}%)`, formatCurrency(profit)],
    ],
    foot: [[
      { content: 'GRAND TOTAL', styles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 11 } },
      { content: formatCurrency(grand), styles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 11, halign: 'right' } },
    ]],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: (pw - 28) * 0.6 }, 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ================= CASTING MATERIALS =================
  y = sectionHeading(doc, y, 'Casting Phase Materials');

  if (S) {
    // Main Floor
    y = ensureRoom(doc, y, 20);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRIMARY);
    doc.text(`Main Floor — ${S.floor.area_m2.toFixed(2)} m²`, 14, y);
    doc.setTextColor(...SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    const floorMeta = [
      S.floor.thickness_mm ? `${S.floor.thickness_mm} mm` : null,
      S.floor.styleName,
      S.floor.patternName,
      S.floor.colour,
    ].filter(Boolean).join(' · ');
    if (floorMeta) doc.text(floorMeta, 14, y + 4);
    y += floorMeta ? 7 : 3;
    y = drawMixTable(doc, y, S.floor.items, 'Floor subtotal', S.floor.subtotal);

    // Skirting
    if (S.skirting) {
      y = ensureRoom(doc, y, 20);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRIMARY);
      doc.text(`Skirting — ${S.skirting.area_m2.toFixed(2)} m²`, 14, y);
      doc.setTextColor(...SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      const skMeta = [
        S.skirting.height_mm && S.skirting.wall_length_m
          ? `${S.skirting.height_mm} mm × ${S.skirting.wall_length_m} m` : null,
        S.skirting.styleName,
        S.skirting.patternName,
        S.skirting.colour,
      ].filter(Boolean).join(' · ');
      if (skMeta) doc.text(skMeta, 14, y + 4);
      y += skMeta ? 7 : 3;
      y = drawMixTable(doc, y, S.skirting.items, 'Skirting subtotal', S.skirting.subtotal);
    }

    // Casting Materials Total bar
    y = ensureRoom(doc, y, 12);
    doc.setFillColor(...MUTED);
    doc.rect(14, y, pw - 28, 9, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('CASTING MATERIALS TOTAL', 18, y + 6);
    doc.text(formatCurrency(S.castingMaterials), pw - 18, y + 6, { align: 'right' });
    y += 14;

    // ================= GRINDING MATERIALS =================
    y = sectionHeading(doc, y, 'Grinding Phase Materials');
    y = drawMixTable(doc, y, S.grindingItems, 'Grinding subtotal', S.grindingMaterials);
  } else {
    // Legacy fallback
    if (input.casting?.length) {
      y = drawMixTable(doc, y, input.casting, 'Casting subtotal',
        input.casting.reduce((s, r) => s + r.total, 0));
    }
    if (input.grinding?.length) {
      y = sectionHeading(doc, y, 'Grinding Phase Materials');
      y = drawMixTable(doc, y, input.grinding, 'Grinding subtotal',
        input.grinding.reduce((s, r) => s + r.total, 0));
    }
  }

  // ================= TERMS =================
  y = sectionHeading(doc, y, 'Terms & Conditions');
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...SLATE);
  const terms = [
    '• Quotation valid for 14 days from date above.',
    '• 50% deposit required to commence work; balance on completion.',
    '• Prices assume site is accessible, subfloor is level and structurally sound.',
    '• Any additional works are quoted separately.',
    input.notes || '',
  ].filter(Boolean);
  terms.forEach(t => {
    y = ensureRoom(doc, y, 6);
    doc.text(t, 14, y);
    y += 5;
  });

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`${input.quoteNumber}  •  Page ${i} of ${total}`, pw / 2, ph - 8, { align: 'center' });
  }

  return doc;
};
