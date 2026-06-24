import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { StyleRow } from '@/lib/presetTypes';

interface Props {
  rows: StyleRow[];
  onChange: (rows: StyleRow[]) => void;
}

export const StylesEditor = ({ rows, onChange }: Props) => {
  const update = (i: number, patch: Partial<StyleRow>) =>
    onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, {
    id: `style-${Date.now()}`,
    name: 'New style',
    description: '',
    materialsRate: 0,
    labourRate: 0,
    active: true,
    sort: rows.length,
  }]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Materials/m²</TableHead>
              <TableHead className="w-[140px]">Labour/m²</TableHead>
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
                  <Input type="number" value={r.materialsRate} onChange={e => update(i, { materialsRate: parseInt(e.target.value) || 0 })} />
                </TableCell>
                <TableCell>
                  <Input type="number" value={r.labourRate} onChange={e => update(i, { labourRate: parseInt(e.target.value) || 0 })} />
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
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No styles. Add one to get started.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add style</Button>
    </div>
  );
};
