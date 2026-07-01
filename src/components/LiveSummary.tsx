import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Download, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePresets } from '@/lib/presetContext';
import {
  WORK_MODES, formatCurrency, calculateRate, calculateTotal, computeMaterials,
  type ComputedMaterial, type WorkMode,
} from '@/lib/presetTypes';
import { EditableTable } from './EditableTable';
import { generateQuotationPdf } from '@/lib/pdf';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { useUpsertCustomer } from '@/hooks/useCustomers';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ClientData { name: string; phone: string; location: string; }

interface LiveSummaryProps {
  client: ClientData;
  area: number;
  workMode: WorkMode;
  styleId: string;
  patternId: string;
}

interface MaterialRowVM { id: string; item: string; quantity: string; price: number; total: number; }

const toRowVM = (m: ComputedMaterial, unit: string): MaterialRowVM => ({
  id: m.id, item: m.item, quantity: `${m.qty} ${unit}`, price: m.unitPrice, total: m.total,
});

export const LiveSummary = ({ client, area, workMode, styleId, patternId }: LiveSummaryProps) => {
  const { toast } = useToast();
  const { activePreset } = usePresets();
  const { session } = useAuth();
  const navigate = useNavigate();
  const upsertCustomer = useUpsertCustomer();
  const createQuotation = useCreateQuotation();
  const config = activePreset.config;

  const style = config.styles.find(s => s.id === styleId)!;
  const pattern = config.patterns.find(p => p.id === patternId)!;
  const modeName = WORK_MODES.find(m => m.id === workMode)!.name;
  const rate = calculateRate(config, styleId, workMode, patternId);
  const total = calculateTotal(config, area, styleId, workMode, patternId);
  const date = new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' });
  const showMaterials = workMode === 'materials' || workMode === 'full';

  const initialCasting = () => computeMaterials(config, 'casting', area).map(m => toRowVM(m, config.materials.casting.find(x => x.id === m.id)?.unit ?? ''));
  const initialGrinding = () => computeMaterials(config, 'grinding', area).map(m => toRowVM(m, config.materials.grinding.find(x => x.id === m.id)?.unit ?? ''));

  const [casting, setCasting] = useState<MaterialRowVM[]>(initialCasting);
  const [grinding, setGrinding] = useState<MaterialRowVM[]>(initialGrinding);
  const [savedNumber, setSavedNumber] = useState<string | null>(null);

  useEffect(() => { setCasting(initialCasting()); setGrinding(initialGrinding()); /* eslint-disable-next-line */ }, [area, activePreset.id]);

  const castingSub = casting.reduce((s, r) => s + r.total, 0);
  const grindingSub = grinding.reduce((s, r) => s + r.total, 0);
  const materialsTotal = castingSub + grindingSub;

  const baseRate = workMode === 'materials' ? style.materialsRate
                  : workMode === 'labour'   ? style.labourRate
                  : style.materialsRate + style.labourRate;

  const buildPdfInput = (quoteNumber: string) => ({
    quoteNumber,
    date,
    presetName: activePreset.name,
    client: { name: client.name, phone: client.phone, location: client.location },
    project: {
      area, workMode, styleName: style.name, patternName: pattern.name,
      multiplier: pattern.multiplier, baseRate, rate, total,
    },
    casting: showMaterials ? casting : undefined,
    grinding: showMaterials ? grinding : undefined,
    materialsTotal: showMaterials ? materialsTotal : undefined,
  });

  const getQuoteText = (num?: string) => {
    const ref = num || savedNumber || '';
    return `TERRAZZO QUOTATION${ref ? ` ${ref}` : ''}
Date: ${date}

Client: ${client.name}
Phone: ${client.phone}
Location: ${client.location}

Area: ${area.toFixed(2)} m²
Mode: ${modeName} • ${style.name} • ${pattern.name}
Rate: ${formatCurrency(rate)}/m²

TOTAL: ${formatCurrency(total)}${showMaterials ? `\nMaterials cost: ${formatCurrency(materialsTotal)}` : ''}

Valid for 14 days.`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getQuoteText());
    toast({ title: 'Copied', description: 'Quotation copied to clipboard' });
  };
  const handleWhatsApp = () => {
    window.open(buildWhatsAppUrl(client.phone, getQuoteText()), '_blank');
  };

  const handlePDF = (num?: string) => {
    const doc = generateQuotationPdf(buildPdfInput(num || savedNumber || 'DRAFT'));
    doc.save(`Quote_${(num || savedNumber || 'DRAFT')}_${client.name.replace(/\s+/g, '_')}.pdf`);
    toast({ title: 'PDF downloaded' });
  };

  const handleSave = async () => {
    if (!session) {
      toast({ title: 'Sign in required', description: 'Sign in to save quotes to your account' });
      navigate('/auth?next=/quotes');
      return;
    }
    try {
      const customer = await upsertCustomer.mutateAsync({
        name: client.name, phone: client.phone, location: client.location || null,
      } as any);
      const materialsSnapshot = { casting, grinding, materialsTotal };
      const created = await createQuotation.mutateAsync({
        customer_id: customer.id,
        customer_name: client.name,
        customer_phone: client.phone,
        customer_location: client.location || null,
        area_m2: area,
        work_mode: workMode,
        style_id: styleId,
        pattern_id: patternId,
        rate_per_m2: rate,
        materials: materialsSnapshot as any,
        subtotal: total,
        total_cost: total,
        profit: 0,
        preset_id: activePreset.id.startsWith('builtin-') ? null : activePreset.id,
        status: 'draft',
      } as any);
      setSavedNumber(created.quote_number);
      toast({ title: 'Quote saved', description: `${created.quote_number} added to your quotes` });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  const saving = upsertCustomer.isPending || createQuotation.isPending;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Quotation Summary</h2>

      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Terrazzo Quotation</h1>
          <p className="text-sm text-muted-foreground">
            {date} • Preset: {activePreset.name}
            {savedNumber && <> • <span className="font-mono">{savedNumber}</span></>}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Client</h3>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Name:</span> {client.name}</div>
              <div><span className="font-medium">Phone:</span> {client.phone}</div>
              <div><span className="font-medium">Location:</span> {client.location}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Project</h3>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Area:</span> {area.toFixed(2)} m²</div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <Badge variant="secondary">{modeName}</Badge>
                <Badge variant="secondary">{style.name}</Badge>
                <Badge variant="secondary">{pattern.name}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead><tr className="bg-primary text-primary-foreground">
              <th className="text-left p-3 font-semibold">Description</th>
              <th className="text-right p-3 font-semibold">Amount</th>
            </tr></thead>
            <tbody>
              <tr className="border-b bg-muted/30"><td className="p-3">Base rate ({style.name})</td><td className="p-3 text-right">{formatCurrency(baseRate)}/m²</td></tr>
              <tr className="border-b"><td className="p-3">Pattern adjustment ({pattern.name})</td><td className="p-3 text-right">×{pattern.multiplier.toFixed(2)}</td></tr>
              <tr className="border-b bg-muted/30"><td className="p-3 font-medium">Adjusted rate per m²</td><td className="p-3 text-right font-medium">{formatCurrency(rate)}/m²</td></tr>
              <tr className="border-b"><td className="p-3">Project area</td><td className="p-3 text-right">{area.toFixed(2)} m²</td></tr>
            </tbody>
            <tfoot><tr className="bg-primary text-primary-foreground">
              <td className="p-3 font-bold text-lg">GRAND TOTAL</td>
              <td className="p-3 text-right font-bold text-lg">{formatCurrency(total)}</td>
            </tr></tfoot>
          </table>
        </div>
      </Card>

      {showMaterials && (
        <>
          {casting.length > 0 && (
            <EditableTable title="Casting Materials" phase="casting" data={casting} formatCurrency={formatCurrency} onDataChange={setCasting} />
          )}
          {grinding.length > 0 && (
            <EditableTable title="Grinding Materials" phase="grinding" data={grinding} formatCurrency={formatCurrency} onDataChange={setGrinding} />
          )}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Materials Grand Total</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(materialsTotal)}</span>
            </div>
          </Card>
        </>
      )}

      <Card className="p-4 sticky bottom-2 shadow-lg border-primary/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary col-span-2 md:col-span-1">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {savedNumber ? 'Update' : 'Save Quote'}
          </Button>
          <Button onClick={() => handlePDF()} variant="outline">
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button onClick={handleWhatsApp} variant="outline" className="text-green-600 border-green-600/40">
            <Share2 className="h-4 w-4 mr-1" /> WhatsApp
          </Button>
          <Button onClick={handleCopy} variant="outline">
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </div>
      </Card>
    </div>
  );
};
