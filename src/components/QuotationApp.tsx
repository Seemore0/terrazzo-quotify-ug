import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { ClientInfoForm } from './ClientInfoForm';
import { WorkModeSelector } from './WorkModeSelector';
import { StyleSelector } from './StyleSelector';
import { PatternSelector } from './PatternSelector';
import { LiveSummary } from './LiveSummary';
import { useToast } from '@/hooks/use-toast';
import {
  type WorkMode, type TerrazzoStyle, type PatternType,
  calculateRate, formatCurrency,
} from '@/lib/pricingConfig';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientData {
  name: string;
  phone: string;
  location: string;
}

const STEPS = ['Client Details', 'Work Mode', 'Terrazzo Style', 'Pattern', 'Summary'];

const QuotationApp = () => {
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const [client, setClient] = useState<ClientData>({ name: '', phone: '', location: '' });
  const [area, setArea] = useState(0);
  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const [style, setStyle] = useState<TerrazzoStyle | null>(null);
  const [pattern, setPattern] = useState<PatternType | null>(null);

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!(client.name && client.phone && client.location && area > 0);
      case 1: return !!workMode;
      case 2: return !!style;
      case 3: return !!pattern;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canNext()) {
      toast({ title: 'Incomplete', description: 'Please complete all fields before proceeding', variant: 'destructive' });
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  // Live rate preview (only when enough selections exist)
  const liveRate = workMode && style && pattern
    ? calculateRate(style, workMode, pattern)
    : null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Terrazzo Quotation Pro
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Professional quotations for Terrazzo flooring projects in Uganda
          </p>
        </div>

        {/* Step progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`hidden sm:inline ${i <= step ? 'text-primary font-medium' : ''}`}
              >
                {label}
              </span>
            ))}
            <span className="sm:hidden text-primary font-medium">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Step content */}
        {step === 0 && (
          <Card className="p-6 shadow-card space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Client & Project Details
            </h2>
            <ClientInfoForm
              data={{ ...client, date: '' }}
              onChange={(d) => setClient({ name: d.name, phone: d.phone, location: d.location })}
            />
            <div className="space-y-2">
              <Label htmlFor="area" className="text-lg font-medium">Project Area (m²) *</Label>
              <Input
                id="area"
                type="number"
                placeholder="Enter area in square meters"
                value={area || ''}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="text-lg shadow-input"
                min="0"
                step="0.01"
              />
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-6 shadow-card">
            <WorkModeSelector selected={workMode} onSelect={setWorkMode} />
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 shadow-card">
            <StyleSelector selected={style} workMode={workMode} onSelect={setStyle} />
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 shadow-card">
            <PatternSelector selected={pattern} onSelect={setPattern} />
          </Card>
        )}

        {step === 4 && workMode && style && pattern && (
          <LiveSummary
            client={client}
            area={area}
            workMode={workMode}
            style={style}
            pattern={pattern}
          />
        )}

        {/* Navigation + live rate */}
        {step < 4 && (
          <div className="mt-6 space-y-4">
            {/* Live rate preview */}
            {liveRate && area > 0 && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium">Live estimate:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(area * liveRate)}
                  </span>
                </div>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="bg-gradient-primary hover:opacity-90">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pattern
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationApp;
