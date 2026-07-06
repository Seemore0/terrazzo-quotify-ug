import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { type Mix, type MixItem, mixTotal, suggestGrindingQtys } from '@/lib/mixTypes';
import { formatCurrency } from '@/lib/presetTypes';

interface Props {
  mix: Mix;
  area: number;
  onChange: (mix: Mix) => void;
}

export const GrindingEditor = ({ mix, area, onChange }: Props) => {
  const total = mixTotal(mix);

  const update = (idx: number, patch: Partial<MixItem>) => {
    onChange({ items: mix.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  };
  const remove = (idx: number) => onChange({ items: mix.items.filter((_, i) => i !== idx) });
  const addCustom = () => onChange({
    items: [...mix.items, {
      key: `custom-${Date.now()}`,
      label: 'Custom grinding item',
      group: 'other',
      qty: 1, unit: 'each', unitPrice: 0, enabled: true,
    }],
  });
  const handleSuggest = () => onChange(suggestGrindingQtys(mix, area));

  return (
    <Card className="p-4 md:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">Grinding Materials</h3>
          <p className="text-xs text-muted-foreground">
            Tick only the items required for this project. Edit qty, unit and price as needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleSuggest} disabled={area <= 0}>
            <Wand2 className="h-4 w-4 mr-1" /> Auto-suggest
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addCustom}>
            <Plus className="h-4 w-4 mr-1" /> Add custom
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {mix.items.map((it, i) => {
          const enabled = it.enabled !== false;
          return (
            <div key={i} className={`grid grid-cols-12 gap-2 items-center rounded-md border p-2 ${enabled ? '' : 'opacity-60 bg-muted/30'}`}>
              <div className="col-span-1 flex justify-center">
                <Checkbox checked={enabled} onCheckedChange={(v) => update(i, { enabled: !!v })} />
              </div>
              <Input
                className="col-span-11 md:col-span-4 h-9 text-sm"
                value={it.label}
                onChange={e => update(i, { label: e.target.value })}
              />
              <div className="col-span-4 md:col-span-2">
                <Input type="number" inputMode="decimal" min="0" step="0.01" placeholder="Qty"
                  className="h-9 text-sm"
                  disabled={!enabled}
                  value={it.qty || ''}
                  onChange={e => update(i, { qty: parseFloat(e.target.value) || 0 })} />
              </div>
              <Input
                className="col-span-3 md:col-span-1 h-9 text-sm"
                disabled={!enabled}
                value={it.unit}
                onChange={e => update(i, { unit: e.target.value })}
              />
              <div className="col-span-4 md:col-span-2">
                <Input type="number" inputMode="numeric" min="0" placeholder="Unit ₴"
                  className="h-9 text-sm"
                  disabled={!enabled}
                  value={it.unitPrice || ''}
                  onChange={e => update(i, { unitPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="col-span-9 md:col-span-1 text-right text-sm font-medium text-primary">
                {enabled ? formatCurrency(it.qty * it.unitPrice) : '—'}
              </div>
              <Button type="button" variant="ghost" size="icon"
                className="col-span-3 md:col-span-1 h-9 w-9 justify-self-end text-destructive"
                onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Grinding subtotal</span>
          <Badge variant="secondary" className="text-xs">
            {mix.items.filter(i => i.enabled !== false).length} selected
          </Badge>
        </div>
        <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
      </div>
    </Card>
  );
};
