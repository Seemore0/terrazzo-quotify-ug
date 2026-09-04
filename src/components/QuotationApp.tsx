import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, ArrowLeft, ArrowRight, FileText, Settings, LogIn, Loader2 } from 'lucide-react';
import { ClientInfoForm } from './ClientInfoForm';
import { FloorSection } from './wizard/FloorSection';
import { SkirtingSection } from './wizard/SkirtingSection';
import { LabourExtras } from './wizard/LabourExtras';
import { ReviewSection } from './wizard/ReviewSection';
import { PresetSwitcher } from './admin/PresetSwitcher';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePresets } from '@/lib/presetContext';
import { DEFAULT_PRESET, type WorkMode } from '@/lib/presetTypes';
import { defaultFloorMix, defaultSkirtingMix, defaultGrindingMix, type Mix } from '@/lib/mixTypes';
import { type Section, type QuoteExtras } from '@/lib/sectionCalc';
import { useNavigate } from 'react-router-dom';
import { useQuotation, useQuotationSections } from '@/hooks/useQuotations';

interface ClientData { name: string; phone: string; location: string; }

const STEPS = ['Client', 'Main Floor', 'Skirting', 'Labour & Extras', 'Review'];

type StoredMaterials = {
  floor?: Mix;
  skirting?: Mix | null;
  grinding?: Mix;
};

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

const QuotationApp = () => {
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { activePreset, presets, setActiveId, loading: presetsLoading } = usePresets();
  const { data: existingQuote, isLoading: quoteLoading, error: quoteError } = useQuotation(editId ?? undefined);
  const { data: existingSections, isLoading: sectionsLoading, error: sectionsError } = useQuotationSections(editId ?? undefined);
  const hydratedId = useRef<string | null>(null);

  const styles = activePreset.config.styles.filter(s => s.active);
  const patterns = activePreset.config.patterns.filter(p => p.active);
  const defaultStyle = styles[0]?.id ?? '';
  const defaultPattern = patterns[0]?.id ?? '';

  const [client, setClient] = useState<ClientData>({ name: '', phone: '', location: '' });
  const [floor, setFloor] = useState<Section>({
    kind: 'floor', area_m2: 0, thickness_mm: 40,
    style_id: defaultStyle, pattern_id: defaultPattern, colour: '',
    mix: defaultFloorMix(),
  });
  const [skirtingEnabled, setSkirtingEnabled] = useState(false);
  const [skirting, setSkirting] = useState<Section>({
    kind: 'skirting', area_m2: 0, height_mm: 100, wall_length_m: 0,
    style_id: defaultStyle, pattern_id: defaultPattern, colour: '',
    mix: defaultSkirtingMix(),
  });
  const [grinding, setGrinding] = useState<Mix>(defaultGrindingMix());
  const [extras, setExtras] = useState<QuoteExtras>({ workMode: 'full', transportCost: 0, profitPct: 15 });
  const [notes, setNotes] = useState('');

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!(client.name && client.phone && client.location);
      case 1: return floor.area_m2 > 0 && !!floor.style_id && !!floor.pattern_id;
      case 2: return !skirtingEnabled || (skirting.area_m2 > 0 && !!skirting.style_id && !!skirting.pattern_id);
      case 3: return !!extras.workMode;
      default: return false;
    }
  };

  useEffect(() => {
    if (!editId || !existingQuote || sectionsLoading || hydratedId.current === editId) return;
    if (presetsLoading) return;

    const targetPresetId = existingQuote.preset_id ?? DEFAULT_PRESET.id;
    const presetAvailable = !existingQuote.preset_id || presets.some(p => p.id === targetPresetId);
    if (!presetAvailable) {
      toast({ title: 'Preset unavailable', description: 'The quote will open with the currently available preset.' });
    }
    if (presets.some(p => p.id === targetPresetId)) setActiveId(targetPresetId);

    const sectionList = existingSections ?? [];
    const floorSection = sectionList.find(section => section.kind === 'floor');
    const skirtingSection = sectionList.find(section => section.kind === 'skirting');
    const materialObject: StoredMaterials = isRecord(existingQuote.materials) ? existingQuote.materials as StoredMaterials : {};

    setClient({
      name: existingQuote.customer_name,
      phone: existingQuote.customer_phone,
      location: existingQuote.customer_location ?? '',
    });
    setFloor({
      kind: 'floor',
      area_m2: Number(floorSection?.area_m2 ?? existingQuote.area_m2 ?? 0),
      thickness_mm: floorSection?.thickness_mm ?? 40,
      style_id: floorSection?.style_id ?? existingQuote.style_id ?? defaultStyle,
      pattern_id: floorSection?.pattern_id ?? existingQuote.pattern_id ?? defaultPattern,
      colour: floorSection?.colour ?? '',
      mix: floorSection?.mix ?? materialObject.floor ?? defaultFloorMix(),
    });

    if (skirtingSection || materialObject.skirting) {
      setSkirtingEnabled(true);
      setSkirting({
        kind: 'skirting',
        area_m2: Number(skirtingSection?.area_m2 ?? 0),
        height_mm: skirtingSection?.height_mm ?? 100,
        wall_length_m: skirtingSection?.wall_length_m ?? 0,
        style_id: skirtingSection?.style_id ?? existingQuote.style_id ?? defaultStyle,
        pattern_id: skirtingSection?.pattern_id ?? existingQuote.pattern_id ?? defaultPattern,
        colour: skirtingSection?.colour ?? '',
        mix: skirtingSection?.mix ?? materialObject.skirting ?? defaultSkirtingMix(),
      });
    } else {
      setSkirtingEnabled(false);
    }

    setGrinding(materialObject.grinding ?? defaultGrindingMix());
    setExtras({
      workMode: existingQuote.work_mode as WorkMode,
      transportCost: Number(existingQuote.transport_cost ?? 0),
      profitPct: Number(existingQuote.profit_pct ?? 0),
    });
    setNotes(existingQuote.notes ?? '');
    hydratedId.current = editId;
    setStep(4);
  }, [editId, existingQuote, existingSections, sectionsLoading, presets, presetsLoading, setActiveId, toast, defaultStyle, defaultPattern]);

  const handleNext = () => {
    if (!canNext()) { toast({ title: 'Incomplete', description: 'Please fill required fields', variant: 'destructive' }); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  if (editId && (quoteLoading || sectionsLoading || presetsLoading)) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading quotation…</div>
      </div>
    );
  }

  if (editId && (quoteError || sectionsError || !existingQuote)) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
        <Card className="p-6 max-w-md text-center space-y-3">
          <h1 className="font-semibold">Quotation could not be loaded</h1>
          <p className="text-sm text-muted-foreground">{quoteError?.message ?? sectionsError?.message ?? 'The requested quotation was not found.'}</p>
          <Button onClick={() => navigate('/quotes')}>Back to quotations</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Terrazzo Quotation Pro
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Multi-section quotations for Uganda's terrazzo contractors</p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium uppercase text-muted-foreground">Preset</span>
            <PresetSwitcher />
          </div>
          <div className="flex items-center gap-2">
            {session
              ? <Button variant="outline" size="sm" onClick={() => navigate('/admin')}><Settings className="h-4 w-4 mr-1" /> Admin</Button>
              : <Button variant="outline" size="sm" onClick={() => navigate('/auth')}><LogIn className="h-4 w-4 mr-1" /> Sign in</Button>}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-primary font-medium mb-2">Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
        </div>

        {step === 0 && (
          <Card className="p-6 shadow-card space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Client Details
            </h2>
            <ClientInfoForm
              data={{ ...client, date: '' }}
              onChange={(d) => setClient({ name: d.name, phone: d.phone, location: d.location })}
            />
          </Card>
        )}
        {step === 1 && <FloorSection section={floor} onChange={setFloor} />}
        {step === 2 && <SkirtingSection enabled={skirtingEnabled} onEnabledChange={setSkirtingEnabled} section={skirting} onChange={setSkirting} />}
        {step === 3 && (
          <LabourExtras
            extras={extras} onChange={setExtras}
            notes={notes} onNotesChange={setNotes}
            grinding={grinding} onGrindingChange={setGrinding}
            totalArea={(floor.area_m2 || 0) + (skirtingEnabled ? (skirting.area_m2 || 0) : 0)}
          />
        )}
        {step === 4 && (
          <ReviewSection client={client} floor={floor}
            skirting={skirtingEnabled ? skirting : null}
            grinding={grinding}
            extras={extras} notes={notes}
            editingQuoteId={editId}
            existingQuoteNumber={existingQuote?.quote_number}
            existingStatus={existingQuote?.status}
          />
        )}

        {step < 4 && (
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 0}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
            <Button onClick={handleNext} className="bg-gradient-primary hover:opacity-90">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        )}
        {step === 4 && (
          <div className="mt-6">
            <Button variant="outline" onClick={handleBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationApp;
