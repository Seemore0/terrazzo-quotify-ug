import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { MaterialRow, Phase } from '@/lib/presetTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  phase: Phase;
  rows: MaterialRow[];
  onChange: (rows: MaterialRow[]) => void;
  /** Show only the unit-price columns (this is the "Material Prices" tab). */
  pricesOnly?: boolean;
}

export const MaterialsEditor = ({ phase, rows, onChange, pricesOnly = false }: Props) => {
  const isMobile = useIsMobile();
  const update = (i: number, patch: Partial<MaterialRow>) =>
    onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, {
    id: `${phase[0]}-${Date.now()}`,
    name: 'New material',
    unit: 'each',
    unitPrice: 0,
    qtyOp: 'divide',
    qtyFactor: 1,
    active: true,
    sort: rows.length,
  }]);

  if (isMobile) {
    return (
      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="text-center text-muted-foreground py-6 border rounded-lg">
            No materials. Add one to get started.
          </div>
        )}
        {rows.map((r, i) => (
          <div key={r.id} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Item</Label>
                <Input value={r.name} onChange={e => update(i, { name: e.target.value })} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive shrink-0 mt-5">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unit</Label>
                <Input value={r.unit} onChange={e => update(i, { unit: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unit price (UGX)</Label>
                <Input type="number" inputMode="numeric" value={r.unitPrice}
                  onChange={e => update(i, { unitPrice: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            {!pricesOnly && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Formula</Label>
                  <select
                    className="border rounded-md h-10 px-2 w-full bg-background text-sm"
                    value={r.qtyOp}
                    onChange={e => update(i, { qtyOp: e.target.value as 'divide' | 'multiply' })}
                  >
                    <option value="divide">area ÷</option>
                    <option value="multiply">area ×</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Factor</Label>
                  <Input type="number" inputMode="decimal" step="0.001" value={r.qtyFactor}
                    onChange={e => update(i, { qtyFactor: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <Label className="text-sm">Active</Label>
              <Switch checked={r.active} onCheckedChange={(v) => update(i, { active: v })} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={add} className="w-full">
          <Plus className="h-4 w-4 mr-1" /> Add material
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead className="w-[100px]">Unit</TableHead>
              <TableHead className="w-[140px]">Unit price (UGX)</TableHead>
              {!pricesOnly && <TableHead className="w-[120px]">Formula</TableHead>}
              {!pricesOnly && <TableHead className="w-[120px]">Factor</TableHead>}
              <TableHead className="w-[80px]">Active</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell><Input value={r.name} onChange={e => update(i, { name: e.target.value })} /></TableCell>
                <TableCell><Input value={r.unit} onChange={e => update(i, { unit: e.target.value })} /></TableCell>
                <TableCell><Input type="number" value={r.unitPrice} onChange={e => update(i, { unitPrice: parseInt(e.target.value) || 0 })} /></TableCell>
                {!pricesOnly && (
                  <TableCell>
                    <select
                      className="border rounded h-9 px-2 w-full bg-background"
                      value={r.qtyOp}
                      onChange={e => update(i, { qtyOp: e.target.value as 'divide' | 'multiply' })}
                    >
                      <option value="divide">area ÷</option>
                      <option value="multiply">area ×</option>
                    </select>
                  </TableCell>
                )}
                {!pricesOnly && (
                  <TableCell>
                    <Input type="number" step="0.001" value={r.qtyFactor} onChange={e => update(i, { qtyFactor: parseFloat(e.target.value) || 0 })} />
                  </TableCell>
                )}
                <TableCell><Switch checked={r.active} onCheckedChange={(v) => update(i, { active: v })} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={pricesOnly ? 5 : 7} className="text-center text-muted-foreground py-6">No materials. Add one to get started.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add material</Button>
    </div>
  );
};
