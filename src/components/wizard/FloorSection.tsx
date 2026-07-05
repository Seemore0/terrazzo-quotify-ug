import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { usePresets } from '@/lib/presetContext';
import { formatCurrency } from '@/lib/presetTypes';
import { MixEditor } from '@/components/mix/MixEditor';
import { type Section } from '@/lib/sectionCalc';
import { suggestFloorQtys, ftToM2 } from '@/lib/mixTypes';
import { useState } from 'react';

interface Props {
  section: Section;
  onChange: (s: Section) => void;
}

export const FloorSection = ({ section, onChange }: Props) => {
  const { activePreset } = usePresets();
  const styles = activePreset.config.styles.filter(s => s.active).sort((a, b) => a.sort - b.sort);
  const patterns = activePreset.config.patterns.filter(p => p.active).sort((a, b) => a.sort - b.sort);
  const [unit, setUnit] = useState<'m2' | 'ft2'>('m2');
  const [rawArea, setRawArea] = useState<string>(section.area_m2 ? String(section.area_m2) : '');

  const setArea = (val: string) => {
    setRawArea(val);
    const n = parseFloat(val) || 0;
    onChange({ ...section, area_m2: unit === 'm2' ? n : ftToM2(n) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Main Floor</h2>
        <p className="text-sm text-muted-foreground">Dimensions, design, and materials for the main floor.</p>
      </div>

      <Card className="p-4 md:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Area *</Label>
            <div className="flex gap-2">
              <Input type="number" inputMode="decimal" min="0" step="0.01"
                value={rawArea} onChange={e => setArea(e.target.value)} placeholder="0" />
              <div className="flex rounded-md border overflow-hidden">
                {(['m2','ft2'] as const).map(u => (
                  <button key={u} type="button" onClick={() => setUnit(u)}
                    className={`px-3 text-xs font-medium ${unit === u ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    {u === 'm2' ? 'm²' : 'ft²'}
                  </button>
                ))}
              </div>
            </div>
            {unit === 'ft2' && rawArea && (
              <p className="text-xs text-muted-foreground">= {section.area_m2.toFixed(2)} m²</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Thickness (mm)</Label>
            <Input type="number" inputMode="numeric" min="0"
              value={section.thickness_mm ?? ''}
              onChange={e => onChange({ ...section, thickness_mm: parseFloat(e.target.value) || null })}
              placeholder="e.g. 40" />
          </div>
          <div className="space-y-1">
            <Label>Colour</Label>
            <Input value={section.colour ?? ''}
              onChange={e => onChange({ ...section, colour: e.target.value })}
              placeholder="e.g. White with black chips" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Style *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {styles.map(s => (
              <button key={s.id} type="button"
                className={`text-left p-3 rounded-lg border transition ${section.style_id === s.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}
                onClick={() => onChange({ ...section, style_id: s.id })}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                    <div className="text-xs text-primary mt-1">Labour {formatCurrency(s.labourRate)}/m²</div>
                  </div>
                  {section.style_id === s.id && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pattern *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {patterns.map(p => (
              <button key={p.id} type="button"
                className={`text-left p-2 rounded-lg border transition ${section.pattern_id === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}
                onClick={() => onChange({ ...section, pattern_id: p.id })}>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">×{p.multiplier.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <MixEditor
        title="Main Floor — Custom Material Mix"
        mix={section.mix}
        area={section.area_m2}
        kind="floor"
        onChange={mix => onChange({ ...section, mix })}
        onSuggest={() => onChange({ ...section, mix: suggestFloorQtys(section.mix, section.area_m2) })}
      />
    </div>
  );
};
