import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkModeSelector } from '@/components/WorkModeSelector';
import { GrindingEditor } from '@/components/mix/GrindingEditor';
import { type QuoteExtras } from '@/lib/sectionCalc';
import type { Mix } from '@/lib/mixTypes';

interface Props {
  extras: QuoteExtras;
  onChange: (e: QuoteExtras) => void;
  notes: string;
  onNotesChange: (n: string) => void;
  grinding: Mix;
  onGrindingChange: (m: Mix) => void;
  totalArea: number;
}

export const LabourExtras = ({
  extras, onChange, notes, onNotesChange,
  grinding, onGrindingChange, totalArea,
}: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Labour, Grinding & Extras</h2>
        <p className="text-sm text-muted-foreground">
          Labour is calculated once on the combined floor + skirting area.
        </p>
      </div>

      <Card className="p-4 md:p-5">
        <WorkModeSelector
          selected={extras.workMode}
          onSelect={(m) => onChange({ ...extras, workMode: m })}
        />
      </Card>

      <GrindingEditor mix={grinding} area={totalArea} onChange={onGrindingChange} />

      <Card className="p-4 md:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Transport cost (UGX)</Label>
            <Input type="number" inputMode="numeric" min="0"
              value={extras.transportCost || ''}
              onChange={e => onChange({ ...extras, transportCost: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 150000" />
          </div>
          <div className="space-y-1">
            <Label>Profit margin (%)</Label>
            <Input type="number" inputMode="decimal" min="0" max="100" step="0.5"
              value={extras.profitPct || ''}
              onChange={e => onChange({ ...extras, profitPct: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 15" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Notes for the client</Label>
            <Textarea value={notes} onChange={e => onNotesChange(e.target.value)}
              placeholder="Optional — appears at the bottom of the PDF."
              rows={3} />
          </div>
        </div>
      </Card>
    </div>
  );
};
