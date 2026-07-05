import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePresets } from '@/lib/presetContext';
import { MixEditor } from '@/components/mix/MixEditor';
import { type Section } from '@/lib/sectionCalc';
import { suggestSkirtingQtys, skirtingAreaFromDims } from '@/lib/mixTypes';
import { useEffect, useState } from 'react';

interface Props {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  section: Section;
  onChange: (s: Section) => void;
}

export const SkirtingSection = ({ enabled, onEnabledChange, section, onChange }: Props) => {
  const { activePreset } = usePresets();
  const styles = activePreset.config.styles.filter(s => s.active).sort((a, b) => a.sort - b.sort);
  const patterns = activePreset.config.patterns.filter(p => p.active).sort((a, b) => a.sort - b.sort);
  const [manualArea, setManualArea] = useState(false);

  // Auto-derive skirting area from height × wall length
  useEffect(() => {
    if (manualArea) return;
    const derived = skirtingAreaFromDims(section.height_mm || 0, section.wall_length_m || 0);
    if (derived !== section.area_m2) onChange({ ...section, area_m2: derived });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.height_mm, section.wall_length_m, manualArea]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Skirting</h2>
          <p className="text-sm text-muted-foreground">Include a wall skirting section? Enter its own dimensions and mix.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sk-toggle" className="text-sm">Include skirting</Label>
          <Switch id="sk-toggle" checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
      </div>

      {enabled && (
        <>
          <Card className="p-4 md:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Height (mm)</Label>
                <Input type="number" inputMode="numeric" min="0"
                  value={section.height_mm ?? ''}
                  onChange={e => onChange({ ...section, height_mm: parseFloat(e.target.value) || null })}
                  placeholder="e.g. 100" />
              </div>
              <div className="space-y-1">
                <Label>Total wall length (m)</Label>
                <Input type="number" inputMode="decimal" min="0" step="0.1"
                  value={section.wall_length_m ?? ''}
                  onChange={e => onChange({ ...section, wall_length_m: parseFloat(e.target.value) || null })}
                  placeholder="e.g. 65" />
              </div>
              <div className="space-y-1">
                <Label>Skirting area (m²)</Label>
                <Input type="number" inputMode="decimal" min="0" step="0.01"
                  value={section.area_m2 || ''}
                  disabled={!manualArea}
                  onChange={e => onChange({ ...section, area_m2: parseFloat(e.target.value) || 0 })} />
                <label className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <input type="checkbox" checked={manualArea} onChange={e => setManualArea(e.target.checked)} />
                  Enter area manually
                </label>
              </div>
              <div className="space-y-1 sm:col-span-3">
                <Label>Colour</Label>
                <Input value={section.colour ?? ''}
                  onChange={e => onChange({ ...section, colour: e.target.value })}
                  placeholder="e.g. Matching floor" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Style</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={section.style_id ?? ''}
                  onChange={e => onChange({ ...section, style_id: e.target.value })}>
                  {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Pattern</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={section.pattern_id ?? ''}
                  onChange={e => onChange({ ...section, pattern_id: e.target.value })}>
                  {patterns.map(p => <option key={p.id} value={p.id}>{p.name} (×{p.multiplier.toFixed(2)})</option>)}
                </select>
              </div>
            </div>
          </Card>

          <MixEditor
            title="Skirting — Custom Material Mix"
            mix={section.mix}
            area={section.area_m2}
            kind="skirting"
            onChange={mix => onChange({ ...section, mix })}
            onSuggest={() => onChange({ ...section, mix: suggestSkirtingQtys(section.mix, section.area_m2) })}
          />
        </>
      )}
    </div>
  );
};
