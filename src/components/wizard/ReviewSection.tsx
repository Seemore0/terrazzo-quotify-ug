import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Copy, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { usePresets } from '@/lib/presetContext';
import { formatCurrency, WORK_MODES } from '@/lib/presetTypes';
import { combineTotals, type Section, type QuoteExtras } from '@/lib/sectionCalc';
import { generateQuotationPdf, type PdfMaterialRow } from '@/lib/pdf';
import { useUpsertCustomer } from '@/hooks/useCustomers';
import { useCreateQuotation, useUpdateQuotation, type QuoteStatus } from '@/hooks/useQuotations';
import { useReplaceSections } from '@/hooks/useQuotationSections';
import { mixEnabledItems, type Mix } from '@/lib/mixTypes';
import { copyToClipboard } from '@/lib/nativeClipboard';
import { openWhatsApp } from '@/lib/nativeShare';
import { saveQuotationPdf } from '@/lib/nativePdf';
import { useState } from 'react';

interface ClientData { name: string; phone: string; location: string; }

interface Props {
  client: ClientData;
  floor: Section;
  skirting: Section | null;
  grinding: Mix;
  extras: QuoteExtras;
  notes: string;
  editingQuoteId?: string | null;
  existingQuoteNumber?: string | null;
  existingStatus?: QuoteStatus;
}

const toRows = (mix: Mix): PdfMaterialRow[] =>
  mixEnabledItems(mix).filter(i => i.qty > 0).map(i => ({
    item: i.label,
    quantity: `${i.qty} ${i.unit}`,
    price: i.unitPrice,
    total: i.qty * i.unitPrice,
  }));

export const ReviewSection = ({
  client, floor, skirting, grinding, extras, notes,
  editingQuoteId = null, existingQuoteNumber = null, existingStatus,
}: Props) => {
  const { activePreset } = usePresets();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const upsertCustomer = useUpsertCustomer();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const replaceSections = useReplaceSections();
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(editingQuoteId);
  const [savedNumber, setSavedNumber] = useState<string | null>(existingQuoteNumber);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus | undefined>(existingStatus);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [copyBusy, setCopyBusy] = useState(false);

  const t = combineTotals(activePreset.config, floor, skirting, extras, grinding);
  const date = new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' });
  const modeName = WORK_MODES.find(m => m.id === extras.workMode)?.name ?? extras.workMode;
  const floorStyle = activePreset.config.styles.find(s => s.id === floor.style_id);
  const floorPattern = activePreset.config.patterns.find(p => p.id === floor.pattern_id);
  const skStyle = skirting ? activePreset.config.styles.find(s => s.id === skirting.style_id) : null;
  const skPattern = skirting ? activePreset.config.patterns.find(p => p.id === skirting.pattern_id) : null;

  const floorRows = toRows(floor.mix);
  const skirtingRows = skirting ? toRows(skirting.mix) : [];
  const grindingRows = toRows(grinding);

  const buildPdf = (quoteNumber: string) =>
    generateQuotationPdf({
      quoteNumber, date,
      presetName: activePreset.name,
      client: { name: client.name, phone: client.phone, location: client.location },
      project: {
        area: t.totalArea, workMode: extras.workMode,
        styleName: floorStyle?.name ?? '—', patternName: floorPattern?.name ?? '—',
        multiplier: floorPattern?.multiplier ?? 1,
        baseRate: t.labourRate, rate: t.labourRate, total: t.grandTotal,
      },
      casting: [...floorRows, ...skirtingRows],
      grinding: grindingRows,
      materialsTotal: t.materialsTotal,
      sectioned: {
        floor: {
          area_m2: t.floorArea, thickness_mm: floor.thickness_mm, colour: floor.colour,
          styleName: floorStyle?.name, patternName: floorPattern?.name,
          items: floorRows, subtotal: t.floorMaterials,
        },
        skirting: skirting ? {
          area_m2: t.skirtingArea,
          height_mm: skirting.height_mm, wall_length_m: skirting.wall_length_m,
          colour: skirting.colour,
          styleName: skStyle?.name, patternName: skPattern?.name,
          items: skirtingRows, subtotal: t.skirtingMaterials,
        } : null,
        grindingItems: grindingRows,
        castingMaterials: t.castingMaterials,
        grindingMaterials: t.grindingMaterials,
        materialsTotal: t.materialsTotal,
        labourCost: t.labourCost,
        transport: t.transport,
        profit: t.profit,
        profitPct: extras.profitPct,
        grandTotal: t.grandTotal,
        modeName,
      },
      notes,
    });

  const getText = (num?: string) => `TERRAZZO QUOTATION${num ? ' ' + num : ''}
Date: ${date}

Client: ${client.name} — ${client.phone}
${client.location ? 'Location: ' + client.location + '\n' : ''}
Main floor: ${t.floorArea.toFixed(2)} m² • ${floorStyle?.name ?? ''} • ${floorPattern?.name ?? ''}
${skirting ? `Skirting: ${t.skirtingArea.toFixed(2)} m²\n` : ''}Combined area: ${t.totalArea.toFixed(2)} m²

Casting materials: ${formatCurrency(t.castingMaterials)}
Grinding materials: ${formatCurrency(t.grindingMaterials)}
Materials total: ${formatCurrency(t.materialsTotal)}
Labour: ${formatCurrency(t.labourCost)}
Transport: ${formatCurrency(t.transport)}
Profit (${extras.profitPct}%): ${formatCurrency(t.profit)}

GRAND TOTAL: ${formatCurrency(t.grandTotal)}

Valid for 14 days.`;

  const handleCopy = async () => {
    if (copyBusy) return;
    setCopyBusy(true);
    try {
      await copyToClipboard(getText(savedNumber ?? undefined));
      toast({ title: 'Quotation copied' });
    } catch (error) {
      console.error('[clipboard] Copy failed', error);
      toast({ title: 'Copy failed. Please try again.', variant: 'destructive' });
    } finally {
      setCopyBusy(false);
    }
  };

  const handleWA = async () => {
    if (shareBusy) return;
    setShareBusy(true);
    toast({ title: 'Opening WhatsApp…' });
    try {
      await openWhatsApp(client.phone, getText(savedNumber ?? undefined));
    } catch (error) {
      console.error('[whatsapp] Share failed', error);
      toast({ title: 'Could not open WhatsApp. You can use Share instead.', variant: 'destructive' });
    } finally {
      setShareBusy(false);
    }
  };

  const handlePDF = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    toast({ title: 'Preparing PDF…' });
    try {
      const number = savedNumber || 'DRAFT';
      const doc = buildPdf(number);
      const clientName = client.name.trim().replace(/\s+/g, '_');
      await saveQuotationPdf(doc, `Quote_${number}_${clientName}.pdf`);
      toast({ title: 'Quotation PDF created successfully' });
    } catch (error) {
      console.error('[pdf] PDF generation/save failed', error);
      toast({ title: 'Could not create the PDF. Please try again.', variant: 'destructive' });
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast({ title: 'Sign in required' });
      navigate('/auth?next=/quotes');
      return;
    }
    try {
      const customer = await upsertCustomer.mutateAsync({
        name: client.name, phone: client.phone, location: client.location || null,
      } as any);

      const patch = {
        customer_id: customer.id,
        customer_name: client.name,
        customer_phone: client.phone,
        customer_location: client.location || null,
        area_m2: t.totalArea,
        work_mode: extras.workMode,
        style_id: floor.style_id,
        pattern_id: floor.pattern_id,
        rate_per_m2: t.labourRate,
        materials: {
          floor: floor.mix,
          skirting: skirting?.mix ?? null,
          grinding,
        } as any,
        subtotal: t.subtotalBeforeProfit,
        total_cost: t.grandTotal,
        profit: t.profit,
        transport_cost: t.transport,
        profit_pct: extras.profitPct,
        has_sections: true,
        notes,
        preset_id: activePreset.id.startsWith('builtin-') ? null : activePreset.id,
        status: quoteStatus ?? 'draft',
      } as any;

      if (activeQuoteId) {
        const updated = await updateQuotation.mutateAsync({ id: activeQuoteId, patch });
        await replaceSections.mutateAsync({
          quoteId: activeQuoteId,
          sections: [
            {
              kind: 'floor', area_m2: t.floorArea,
              height_mm: null, wall_length_m: null, thickness_mm: floor.thickness_mm ?? null,
              style_id: floor.style_id, pattern_id: floor.pattern_id, colour: floor.colour ?? null,
              rate_per_m2: t.labourRate, materials_cost: t.floorMaterials,
              mix: floor.mix, sort: 0,
            },
            ...(skirting ? [{
              kind: 'skirting' as const, area_m2: t.skirtingArea,
              height_mm: skirting.height_mm ?? null, wall_length_m: skirting.wall_length_m ?? null,
              thickness_mm: null,
              style_id: skirting.style_id, pattern_id: skirting.pattern_id, colour: skirting.colour ?? null,
              rate_per_m2: t.labourRate, materials_cost: t.skirtingMaterials,
              mix: skirting.mix, sort: 1,
            }] : []),
          ],
        });
        setSavedNumber(updated.quote_number);
        setQuoteStatus(updated.status);
        toast({ title: 'Quote updated successfully', description: `${updated.quote_number} updated` });
        return;
      }

      const created = await createQuotation.mutateAsync({
        ...patch,
        status: 'draft',
      });
      await replaceSections.mutateAsync({
        quoteId: created.id,
        sections: [
          {
            kind: 'floor', area_m2: t.floorArea,
            height_mm: null, wall_length_m: null, thickness_mm: floor.thickness_mm ?? null,
            style_id: floor.style_id, pattern_id: floor.pattern_id, colour: floor.colour ?? null,
            rate_per_m2: t.labourRate, materials_cost: t.floorMaterials,
            mix: floor.mix, sort: 0,
          },
          ...(skirting ? [{
            kind: 'skirting' as const, area_m2: t.skirtingArea,
            height_mm: skirting.height_mm ?? null, wall_length_m: skirting.wall_length_m ?? null,
            thickness_mm: null,
            style_id: skirting.style_id, pattern_id: skirting.pattern_id, colour: skirting.colour ?? null,
            rate_per_m2: t.labourRate, materials_cost: t.skirtingMaterials,
            mix: skirting.mix, sort: 1,
          }] : []),
        ],
      });
      setActiveQuoteId(created.id);
      setSavedNumber(created.quote_number);
      setQuoteStatus(created.status);
      toast({ title: 'Quote saved', description: `${created.quote_number} added to your quotes` });
    } catch (error) {
      console.error('[quote] Save/update failed', error);
      toast({
        title: activeQuoteId ? 'Update failed' : 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const saving = upsertCustomer.isPending || createQuotation.isPending || updateQuotation.isPending || replaceSections.isPending;

  const renderMixTable = (rows: PdfMaterialRow[], subtotalLabel: string, subtotal: number) => (
    <table className="w-full text-sm border rounded overflow-hidden">
      <thead className="bg-muted">
        <tr>
          <th className="p-2 text-left">Item</th>
          <th className="p-2 text-right">Qty</th>
          <th className="p-2 text-right">Unit</th>
          <th className="p-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-2">{r.item}</td>
            <td className="p-2 text-right">{r.quantity}</td>
            <td className="p-2 text-right">{formatCurrency(r.price)}</td>
            <td className="p-2 text-right">{formatCurrency(r.total)}</td>
          </tr>
        ))}
        {!rows.length && (
          <tr><td colSpan={4} className="p-3 text-center text-xs text-muted-foreground">No items selected.</td></tr>
        )}
      </tbody>
      <tfoot>
        <tr className="bg-primary/5">
          <td colSpan={3} className="p-2 font-medium">{subtotalLabel}</td>
          <td className="p-2 text-right font-bold">{formatCurrency(subtotal)}</td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review & Send</h2>

      <Card className="p-4 md:p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{modeName}</Badge>
          {floorStyle && <Badge variant="secondary">{floorStyle.name}</Badge>}
          {floorPattern && <Badge variant="secondary">{floorPattern.name}</Badge>}
          {savedNumber && <Badge className="font-mono">{savedNumber}</Badge>}
        </div>
        <div className="text-sm">
          <p><strong>{client.name}</strong> — {client.phone} {client.location && `· ${client.location}`}</p>
        </div>
      </Card>

      <Card className="p-4 md:p-5">
        <h3 className="font-semibold text-primary mb-3">Cost Summary</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-2">Casting materials</td><td className="p-2 text-right">{formatCurrency(t.castingMaterials)}</td></tr>
            <tr className="border-b"><td className="p-2">Grinding materials</td><td className="p-2 text-right">{formatCurrency(t.grindingMaterials)}</td></tr>
            <tr className="border-b font-medium"><td className="p-2">Total materials cost</td><td className="p-2 text-right">{formatCurrency(t.materialsTotal)}</td></tr>
            <tr className="border-b"><td className="p-2">Labour ({t.totalArea.toFixed(2)} m² × {formatCurrency(t.labourRate)}/m²)</td><td className="p-2 text-right">{formatCurrency(t.labourCost)}</td></tr>
            <tr className="border-b"><td className="p-2">Transport</td><td className="p-2 text-right">{formatCurrency(t.transport)}</td></tr>
            <tr className="border-b"><td className="p-2">Profit ({extras.profitPct}%)</td><td className="p-2 text-right">{formatCurrency(t.profit)}</td></tr>
          </tbody>
          <tfoot>
            <tr className="bg-primary text-primary-foreground">
              <td className="p-3 font-bold text-lg">GRAND TOTAL</td>
              <td className="p-3 text-right font-bold text-lg">{formatCurrency(t.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <Card className="p-4 md:p-5 space-y-4">
        <h3 className="font-semibold text-primary">Casting Phase Materials</h3>
        <div className="space-y-2">
          <div className="text-sm font-medium">Main Floor · {t.floorArea.toFixed(2)} m²{floor.thickness_mm ? ` · ${floor.thickness_mm} mm` : ''}{floor.colour ? ` · ${floor.colour}` : ''}</div>
          {renderMixTable(floorRows, 'Floor subtotal', t.floorMaterials)}
        </div>
        {skirting && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Skirting · {t.skirtingArea.toFixed(2)} m²
              {skirting.height_mm && skirting.wall_length_m ? ` (${skirting.height_mm} mm × ${skirting.wall_length_m} m)` : ''}
              {skirting.colour ? ` · ${skirting.colour}` : ''}
            </div>
            {renderMixTable(skirtingRows, 'Skirting subtotal', t.skirtingMaterials)}
          </div>
        )}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="font-medium">Casting Materials Total</span>
          <span className="font-bold text-primary">{formatCurrency(t.castingMaterials)}</span>
        </div>
      </Card>

      <Card className="p-4 md:p-5 space-y-3">
        <h3 className="font-semibold text-primary">Grinding Phase Materials</h3>
        {renderMixTable(grindingRows, 'Grinding subtotal', t.grindingMaterials)}
      </Card>

      <Card className="p-3 sticky bottom-2 shadow-lg border-primary/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={handleSave} disabled={saving || pdfBusy || shareBusy || copyBusy} className="col-span-2 md:col-span-1 bg-gradient-primary">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {activeQuoteId ? 'Update Quote' : 'Save Quote'}
          </Button>
          <Button onClick={handlePDF} disabled={pdfBusy || saving} variant="outline">
            {pdfBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            {pdfBusy ? 'Preparing…' : 'PDF'}
          </Button>
          <Button onClick={handleWA} disabled={shareBusy || saving} variant="outline" className="text-green-600 border-green-600/40">
            {shareBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Share2 className="h-4 w-4 mr-1" />}
            {shareBusy ? 'Opening…' : 'WhatsApp'}
          </Button>
          <Button onClick={handleCopy} disabled={copyBusy || saving} variant="outline">
            {copyBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Copy className="h-4 w-4 mr-1" />}
            {copyBusy ? 'Copying…' : 'Copy'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
