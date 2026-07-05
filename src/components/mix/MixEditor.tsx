import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wand2, Save, BookmarkPlus } from 'lucide-react';
import {
  type Mix, type MixItem, type MixGroup,
  mixTotal, validateMix,
} from '@/lib/mixTypes';
import { formatCurrency } from '@/lib/presetTypes';
import { MixPresetPicker } from './MixPresetPicker';
import { useSaveMixPreset } from '@/hooks/useMixPresets';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

interface MixEditorProps {
  title: string;
  mix: Mix;
  area: number;
  kind: 'floor' | 'skirting';
  onChange: (mix: Mix) => void;
  onSuggest?: () => void;
}

const GROUP_LABEL: Record<MixGroup, string> = {
  stones: 'Stones',
  cement: 'Cement',
  oxides: 'Oxides',
  other: 'Other Materials',
};

const GROUP_ORDER: MixGroup[] = ['stones', 'cement', 'oxides', 'other'];

export const MixEditor = ({ title, mix, area, kind, onChange, onSuggest }: MixEditorProps) => {
  const { toast } = useToast();
  const savePreset = useSaveMixPreset();
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const total = mixTotal(mix);
  const issues = validateMix(mix, area);

  const updateItem = (idx: number, patch: Partial<MixItem>) => {
    onChange({ items: mix.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  };
  const removeItem = (idx: number) => {
    onChange({ items: mix.items.filter((_, i) => i !== idx) });
  };
  const addCustom = (group: MixGroup) => {
    onChange({
      items: [...mix.items, {
        key: `custom-${Date.now()}`,
        label: 'Custom item',
        group,
        qty: 0,
        unit: group === 'oxides' ? 'kg' : 'bag',
        unitPrice: 0,
      }],
    });
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    try {
      await savePreset.mutateAsync({ name: presetName.trim(), kind, mix });
      toast({ title: 'Mix saved', description: `"${presetName}" is now in your library` });
      setSaveOpen(false); setPresetName('');
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Card className="p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-xs text-muted-foreground">Enter quantities in bags/kg. Unit prices are editable.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MixPresetPicker kind={kind} onSelect={(loaded) => onChange(loaded)} />
          {onSuggest && (
            <Button type="button" variant="outline" size="sm" onClick={onSuggest} disabled={area <= 0}>
              <Wand2 className="h-4 w-4 mr-1" /> Auto-suggest
            </Button>
          )}
          <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-1" /> Save mix
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Save mix preset</DialogTitle></DialogHeader>
              <Label>Preset name</Label>
              <Input value={presetName} onChange={e => setPresetName(e.target.value)}
                placeholder="e.g. Client office lobby" />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePreset} disabled={!presetName.trim() || savePreset.isPending}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {GROUP_ORDER.map(group => {
        const items = mix.items.map((it, i) => ({ it, i })).filter(x => x.it.group === group);
        if (!items.length && group === 'other') return null;
        const groupSubtotal = items.reduce((s, x) => s + x.it.qty * x.it.unitPrice, 0);
        return (
          <div key={group} className="space-y-2 border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{GROUP_LABEL[group]}</span>
                <Badge variant="secondary" className="text-xs">{formatCurrency(groupSubtotal)}</Badge>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => addCustom(group)}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {items.map(({ it, i }) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-12 md:col-span-4 text-sm h-9"
                    value={it.label}
                    onChange={e => updateItem(i, { label: e.target.value })}
                  />
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number" inputMode="decimal" min="0" step="0.01" placeholder="Qty"
                      className="h-9 text-sm"
                      value={it.qty || ''}
                      onChange={e => updateItem(i, { qty: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Input
                    className="col-span-3 md:col-span-2 h-9 text-sm"
                    value={it.unit}
                    onChange={e => updateItem(i, { unit: e.target.value })}
                  />
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number" inputMode="numeric" min="0" placeholder="Unit ₴"
                      className="h-9 text-sm"
                      value={it.unitPrice || ''}
                      onChange={e => updateItem(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-9 md:col-span-1 text-right text-sm font-medium text-primary">
                    {formatCurrency(it.qty * it.unitPrice)}
                  </div>
                  <Button type="button" variant="ghost" size="icon"
                    className="col-span-3 md:col-span-1 h-9 w-9 justify-self-end text-destructive"
                    onClick={() => removeItem(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!items.length && (
                <p className="text-xs text-muted-foreground text-center py-2">No items — press "Add" to include {GROUP_LABEL[group].toLowerCase()}.</p>
              )}
            </div>
          </div>
        );
      })}

      {issues.length > 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
          {issues.map((iss, idx) => (
            <p key={idx} className={`text-xs ${iss.level === 'error' ? 'text-destructive' : 'text-amber-700 dark:text-amber-300'}`}>
              {iss.level === 'error' ? '⛔ ' : '⚠️ '}{iss.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
        <span className="font-medium text-sm">Section materials subtotal</span>
        <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
      </div>
    </Card>
  );
};
