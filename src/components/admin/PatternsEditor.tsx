import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { PatternRow } from '@/lib/presetTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  rows: PatternRow[];
  onChange: (rows: PatternRow[]) => void;
}

const effectLabel = (m: number) =>
  m === 1 ? 'no change' : `${m > 1 ? '+' : ''}${Math.round((m - 1) * 100)}%`;

export const PatternsEditor = ({ rows, onChange }: Props) => {
  const isMobile = useIsMobile();
  const update = (i: number, patch: Partial<PatternRow>) =>
    onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, {
    id: `pattern-${Date.now()}`,
    name: 'New pattern',
    description: '',
    multiplier: 1,
    active: true,
    sort: rows.length,
  }]);

  if (isMobile) {
    return (
      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="text-center text-muted-foreground py-6 border rounded-lg">
            No patterns. Add one to get started.
          </div>
        )}
        {rows.map((r, i) => (
          <div key={r.id} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={r.name} onChange={e => update(i, { name: e.target.value })} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive shrink-0 mt-5">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input value={r.description} onChange={e => update(i, { description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Multiplier</Label>
                <Input type="number" inputMode="decimal" step="0.05" min="0" value={r.multiplier}
                  onChange={e => update(i, { multiplier: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Effect</Label>
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/40 text-sm">
                  {effectLabel(r.multiplier)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <Label className="text-sm">Active</Label>
              <Switch checked={r.active} onCheckedChange={(v) => update(i, { active: v })} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={add} className="w-full">
          <Plus className="h-4 w-4 mr-1" /> Add pattern
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
              <TableHead className="w-[160px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Multiplier</TableHead>
              <TableHead className="w-[100px]">Effect</TableHead>
              <TableHead className="w-[80px]">Active</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Input value={r.name} onChange={e => update(i, { name: e.target.value })} />
                </TableCell>
                <TableCell>
                  <Input value={r.description} onChange={e => update(i, { description: e.target.value })} />
                </TableCell>
                <TableCell>
                  <Input type="number" step="0.05" min="0" value={r.multiplier}
                    onChange={e => update(i, { multiplier: parseFloat(e.target.value) || 0 })} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {effectLabel(r.multiplier)}
                </TableCell>
                <TableCell>
                  <Switch checked={r.active} onCheckedChange={(v) => update(i, { active: v })} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No patterns. Add one to get started.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add pattern</Button>
    </div>
  );
};
