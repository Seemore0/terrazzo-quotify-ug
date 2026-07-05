import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trash2, Loader2 } from 'lucide-react';
import { useMixPresets, useDeleteMixPreset, type MixPresetKind } from '@/hooks/useMixPresets';
import { defaultFloorMix, defaultSkirtingMix, type Mix, type MixItem } from '@/lib/mixTypes';
import { useToast } from '@/hooks/use-toast';

interface Props {
  kind: 'floor' | 'skirting';
  onSelect: (mix: Mix) => void;
}

/** Merge a preset's ratio-based mix into the default catalog so unit prices stay set.
 *  Preset ratios (0..1) are used as qty seeds proportional to a base of 10 bags stones + 5 kg oxides.
 *  Users then tweak the numbers directly in the editor. */
const applyPresetRatios = (kind: 'floor' | 'skirting', raw: any): Mix => {
  const base: Mix = kind === 'floor' ? defaultFloorMix() : defaultSkirtingMix();
  if (!raw || typeof raw !== 'object') return base;
  // If preset already stores our full MixItem format, just return it
  if (Array.isArray(raw.items)) return raw as Mix;

  const stonesBase = 10; // bags
  const cementBase = 5;
  const oxidesBase = 2;  // kg
  const stones = raw.stones ?? {};
  const cement = raw.cement ?? {};
  const oxides = raw.oxides ?? {};

  const items: MixItem[] = base.items.map(it => {
    if (it.key === 'stones-white')   return { ...it, qty: Math.round((stones.white ?? 0) * stonesBase * 10) / 10 };
    if (it.key === 'stones-black')   return { ...it, qty: Math.round((stones.black ?? 0) * stonesBase * 10) / 10 };
    if (it.key === 'stones-red')     return { ...it, qty: Math.round((stones.red ?? 0) * stonesBase * 10) / 10 };
    if (it.key === 'cement-white')   return { ...it, qty: Math.round((cement.white ?? 0) * cementBase * 10) / 10 };
    if (it.key === 'cement-opc')     return { ...it, qty: Math.round((cement.opc ?? 0) * cementBase * 10) / 10 };
    if (it.key === 'oxide-black')    return { ...it, qty: Math.round((oxides.black ?? 0) * oxidesBase * 10) / 10 };
    if (it.key === 'oxide-red')      return { ...it, qty: Math.round((oxides.red ?? 0) * oxidesBase * 10) / 10 };
    if (it.key === 'oxide-yellow')   return { ...it, qty: Math.round((oxides.yellow ?? 0) * oxidesBase * 10) / 10 };
    if (it.key === 'oxide-green')    return { ...it, qty: Math.round((oxides.green ?? 0) * oxidesBase * 10) / 10 };
    if (it.key === 'oxide-blue')     return { ...it, qty: Math.round((oxides.blue ?? 0) * oxidesBase * 10) / 10 };
    return it;
  });
  return { items };
};

export const MixPresetPicker = ({ kind, onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const { data: presets, isLoading } = useMixPresets();
  const del = useDeleteMixPreset();
  const { toast } = useToast();

  const eligible = (presets ?? []).filter(p =>
    p.kind === 'any' || p.kind === (kind as MixPresetKind)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-1" /> Load preset
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2 max-h-80 overflow-y-auto">
        {isLoading && <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>}
        {!isLoading && eligible.length === 0 && (
          <p className="text-sm text-muted-foreground px-2 py-3">No mix presets yet.</p>
        )}
        <div className="space-y-1">
          {eligible.map(p => (
            <div key={p.id} className="flex items-center gap-2 group">
              <Button
                type="button" variant="ghost"
                className="flex-1 justify-between h-auto py-2"
                onClick={() => { onSelect(applyPresetRatios(kind, p.mix)); setOpen(false); toast({ title: 'Mix loaded', description: p.name }); }}
              >
                <span className="truncate text-left">{p.name}</span>
                {p.is_builtin && <Badge variant="secondary" className="text-[10px] ml-2">Built-in</Badge>}
              </Button>
              {!p.is_builtin && (
                <Button type="button" size="icon" variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                  onClick={async () => {
                    try { await del.mutateAsync(p.id); toast({ title: 'Preset deleted' }); }
                    catch (e: any) { toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }); }
                  }}
                ><Trash2 className="h-4 w-4" /></Button>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
