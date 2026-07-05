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
import { generateQuotationPdf } from '@/lib/pdf';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { useUpsertCustomer } from '@/hooks/useCustomers';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useReplaceSections } from '@/hooks/useQuotationSections';
import { useState } from 'react';

interface ClientData { name: string; phone: string; location: string; }

interface Props {
  client: ClientData;
  floor: Section;
  skirting: Section | null;
  extras: QuoteExtras;
  notes: string;
}

export const ReviewSection = ({ client, floor, skirting, extras, notes }: Props) => {
  const { activePreset } = usePresets();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const upsertCustomer = useUpsertCustomer();
  const createQuotation = useCreateQuotation();
  const replaceSections = useReplaceSections();
  const [savedNumber, setSavedNumber] = useState<string | null>(null);

  const t = combineTotals(activePreset.config, floor, skirting, extras);
  const date = new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' });
  const modeName = WORK_MODES.find(m => m.id === extras.workMode)?.name ?? extras.workMode;
  const floorStyle = activePreset.config.styles.find(s => s.id === floor.style_id);
  const floorPattern = activePreset.config.patterns.find(p => p.id === floor.pattern_id);
  const skStyle = skirting ? activePreset.config.styles.find(s => s.id === skirting.style_id) : null;
  const skPattern = skirting ? activePreset.config.patterns.find(p => p.id === skirting.pattern_id) : null;

  const buildPdf = (quoteNumber: string) => {
    const castingRows = floor.mix.items
      .filter(i => i.qty > 0)
      .map(i => ({ item: i.label, quantity: `${i.qty} ${i.unit}`, price: i.unitPrice, total: i.qty * i.unitPrice }));
    const grindingRows = skirting
      ? skirting.mix.items.filter(i => i.qty > 0)
          .map(i => ({ item: i.label, quantity: `${i.qty} ${i.unit}`, price: i.unitPrice, total: i.qty * i.unitPrice }))
      : [];

    return generateQuotationPdf({
      quoteNumber, date,
      presetName: activePreset.name,
      client: { name: client.name, phone: client.phone, location: client.location },
      project: {
        area: t.totalArea, workMode: extras.workMode,
        styleName: floorStyle?.name ?? '—', patternName: floorPattern?.name ?? '—',
        multiplier: floorPattern?.multiplier ?? 1,
        baseRate: t.labourRate, rate: t.labourRate, total: t.grandTotal,
      },
      casting: castingRows,
      grinding: grindingRows,
      materialsTotal: t.materialsTotal,
      // Extended fields for sectioned summary:
      sectioned: {
        floor: {
          area_m2: t.floorArea, thickness_mm: floor.thickness_mm, colour: floor.colour,
          styleName: floorStyle?.name, patternName: floorPattern?.name,
          items: castingRows, subtotal: t.floorMaterials,
        },
        skirting: skirting ? {
          area_m2: t.skirtingArea,
          height_mm: skirting.height_mm, wall_length_m: skirting.wall_length_m,
          colour: skirting.colour,
          styleName: skStyle?.name, patternName: skPattern?.name,
          items: grindingRows, subtotal: t.skirtingMaterials,
        } : null,
        labourCost: t.labourCost,
        transport: t.transport,
        profit: t.profit,
        profitPct: extras.profitPct,
        grandTotal: t.grandTotal,
        modeName,
      },
      notes,
    } as any);
  };

  const getText = (num?: string) => `TERRAZZO QUOTATION${num ? ' ' + num : ''}
Date: ${date}

Client: ${client.name} — ${client.phone}
${client.location ? 'Location: ' + client.location + '\n' : ''}
Main floor: ${t.floorArea.toFixed(2)} m² • ${floorStyle?.name ?? ''} • ${floorPattern?.name ?? ''}
${skirting ? `Skirting: ${t.skirtingArea.toFixed(2)} m²\n` : ''}Combined area: ${t.totalArea.toFixed(2)} m²

Materials: ${formatCurrency(t.materialsTotal)}
Labour: ${formatCurrency(t.labourCost)}
Transport: ${formatCurrency(t.transport)}
Profit (${extras.profitPct}%): ${formatCurrency(t.profit)}

GRAND TOTAL: ${formatCurrency(t.grandTotal)}

Valid for 14 days.`;

  const handleCopy = async () => { await navigator.clipboard.writeText(getText(savedNumber ?? undefined)); toast({ title: 'Copied' }); };
  const handleWA = () => window.open(buildWhatsAppUrl(client.phone, getText(savedNumber ?? undefined)), '_blank');
  const handlePDF = () => {
    const doc = buildPdf(savedNumber || 'DRAFT');
    doc.save(`Quote_${(savedNumber || 'DRAFT')}_${client.name.replace(/\s+/g, '_')}.pdf`);
    toast({ title: 'PDF downloaded' });
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
      const created = await createQuotation.mutateAsync({
        customer_id: customer.id,
        customer_name: client.name,
        customer_phone: client.phone,
        customer_location: client.location || null,
        area_m2: t.totalArea,
        work_mode: extras.workMode,
        style_id: floor.style_id,
        pattern_id: floor.pattern_id,
        rate_per_m2: t.labourRate,
        materials: { floor: floor.mix, skirting: skirting?.mix ?? null } as any,
        subtotal: t.subtotalBeforeProfit,
        total_cost: t.grandTotal,
        profit: t.profit,
        transport_cost: t.transport,
        profit_pct: extras.profitPct,
        has_sections: true,
        notes,
        preset_id: activePreset.id.startsWith('builtin-') ? null : activePreset.id,
        status: 'draft',
      } as any);
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
      setSavedNumber(created.quote_number);
      toast({ title: 'Quote saved', description: `${created.quote_number} added to your quotes` });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  const saving = upsertCustomer.isPending || createQuotation.isPending || replaceSections.isPending;

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

      <Card className="p-4 md:p-5 space-y-3">
        <h3 className="font-semibold text-primary">Main Floor</h3>
        <div className="text-sm space-y-1">
          <div>Area: <strong>{t.floorArea.toFixed(2)} m²</strong>{floor.thickness_mm ? ` · ${floor.thickness_mm} mm thick` : ''}</div>
          {floor.colour && <div>Colour: {floor.colour}</div>}
          <div>Style: {floorStyle?.name} · Pattern: {floorPattern?.name}</div>
        </div>
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-muted"><tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Unit</th><th className="p-2 text-right">Total</th></tr></thead>
          <tbody>
            {floor.mix.items.filter(i => i.qty > 0).map(i => (
              <tr key={i.key} className="border-t">
                <td className="p-2">{i.label}</td>
                <td className="p-2 text-right">{i.qty} {i.unit}</td>
                <td className="p-2 text-right">{formatCurrency(i.unitPrice)}</td>
                <td className="p-2 text-right">{formatCurrency(i.qty * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="bg-primary/5"><td colSpan={3} className="p-2 font-medium">Floor subtotal</td><td className="p-2 text-right font-bold">{formatCurrency(t.floorMaterials)}</td></tr></tfoot>
        </table>
      </Card>

      {skirting && (
        <Card className="p-4 md:p-5 space-y-3">
          <h3 className="font-semibold text-primary">Skirting</h3>
          <div className="text-sm space-y-1">
            <div>Area: <strong>{t.skirtingArea.toFixed(2)} m²</strong>{skirting.height_mm && skirting.wall_length_m ? ` (${skirting.height_mm} mm × ${skirting.wall_length_m} m)` : ''}</div>
            {skirting.colour && <div>Colour: {skirting.colour}</div>}
            <div>Style: {skStyle?.name} · Pattern: {skPattern?.name}</div>
          </div>
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead className="bg-muted"><tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Unit</th><th className="p-2 text-right">Total</th></tr></thead>
            <tbody>
              {skirting.mix.items.filter(i => i.qty > 0).map(i => (
                <tr key={i.key} className="border-t">
                  <td className="p-2">{i.label}</td>
                  <td className="p-2 text-right">{i.qty} {i.unit}</td>
                  <td className="p-2 text-right">{formatCurrency(i.unitPrice)}</td>
                  <td className="p-2 text-right">{formatCurrency(i.qty * i.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-primary/5"><td colSpan={3} className="p-2 font-medium">Skirting subtotal</td><td className="p-2 text-right font-bold">{formatCurrency(t.skirtingMaterials)}</td></tr></tfoot>
          </table>
        </Card>
      )}

      <Card className="p-4 md:p-5">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-2">Materials total</td><td className="p-2 text-right">{formatCurrency(t.materialsTotal)}</td></tr>
            <tr className="border-b"><td className="p-2">Labour ({t.totalArea.toFixed(2)} m² × {formatCurrency(t.labourRate)}/m²)</td><td className="p-2 text-right">{formatCurrency(t.labourCost)}</td></tr>
            <tr className="border-b"><td className="p-2">Transport</td><td className="p-2 text-right">{formatCurrency(t.transport)}</td></tr>
            <tr className="border-b"><td className="p-2">Profit ({extras.profitPct}%)</td><td className="p-2 text-right">{formatCurrency(t.profit)}</td></tr>
          </tbody>
          <tfoot><tr className="bg-primary text-primary-foreground"><td className="p-3 font-bold text-lg">GRAND TOTAL</td><td className="p-3 text-right font-bold text-lg">{formatCurrency(t.grandTotal)}</td></tr></tfoot>
        </table>
      </Card>

      <Card className="p-3 sticky bottom-2 shadow-lg border-primary/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={handleSave} disabled={saving} className="col-span-2 md:col-span-1 bg-gradient-primary">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {savedNumber ? 'Update' : 'Save Quote'}
          </Button>
          <Button onClick={handlePDF} variant="outline"><Download className="h-4 w-4 mr-1" /> PDF</Button>
          <Button onClick={handleWA} variant="outline" className="text-green-600 border-green-600/40"><Share2 className="h-4 w-4 mr-1" /> WhatsApp</Button>
          <Button onClick={handleCopy} variant="outline"><Copy className="h-4 w-4 mr-1" /> Copy</Button>
        </div>
      </Card>
    </div>
  );
};
