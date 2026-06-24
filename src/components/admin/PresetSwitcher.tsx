import { useState } from 'react';
import { usePresets } from '@/lib/presetContext';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { createPreset, deletePreset, duplicatePreset } from '@/lib/presetsApi';
import { DEFAULT_CONFIG, DEFAULT_PRESET } from '@/lib/presetTypes';
import { toast } from 'sonner';

interface Props {
  /** show full CRUD controls (admin) vs read-only switcher (wizard) */
  manage?: boolean;
}

export const PresetSwitcher = ({ manage = false }: Props) => {
  const { presets, activeId, setActiveId, activePreset, refresh } = usePresets();
  const { user } = useAuth();
  const [newName, setNewName] = useState('');
  const [dupName, setDupName] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [openDup, setOpenDup] = useState(false);
  const [busy, setBusy] = useState(false);

  const canEditActive = !!user && !!activePreset.owner_id && activePreset.owner_id === user.id;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const p = await createPreset(newName.trim(), structuredClone(DEFAULT_CONFIG), false);
      await refresh();
      setActiveId(p.id);
      setNewName('');
      setOpenNew(false);
      toast.success(`Created preset "${p.name}"`);
    } catch (e: any) { toast.error(e?.message ?? 'Failed to create preset'); }
    finally { setBusy(false); }
  };

  const handleDuplicate = async () => {
    if (!dupName.trim()) return;
    setBusy(true);
    try {
      const p = await duplicatePreset(activePreset, dupName.trim());
      await refresh();
      setActiveId(p.id);
      setDupName('');
      setOpenDup(false);
      toast.success(`Duplicated as "${p.name}"`);
    } catch (e: any) { toast.error(e?.message ?? 'Failed to duplicate'); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!canEditActive) return;
    if (!confirm(`Delete preset "${activePreset.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deletePreset(activePreset.id);
      setActiveId(DEFAULT_PRESET.id);
      await refresh();
      toast.success('Preset deleted');
    } catch (e: any) { toast.error(e?.message ?? 'Failed to delete'); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={activeId} onValueChange={setActiveId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select preset" />
        </SelectTrigger>
        <SelectContent>
          {presets.map(p => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}{p.is_public && !p.owner_id ? ' (public)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {manage && (
        <>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!user}>
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New preset</DialogTitle>
                <DialogDescription>Starts from the default values; you can edit anything afterwards.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="new-name">Name</Label>
                <Input id="new-name" placeholder="e.g. Residential, Commercial, Budget" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={busy || !newName.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openDup} onOpenChange={setOpenDup}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!user}>
                <Copy className="h-4 w-4 mr-1" /> Duplicate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Duplicate "{activePreset.name}"</DialogTitle>
                <DialogDescription>Creates a private copy you can edit.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="dup-name">New name</Label>
                <Input id="dup-name" placeholder={`${activePreset.name} (copy)`} value={dupName} onChange={e => setDupName(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDup(false)}>Cancel</Button>
                <Button onClick={handleDuplicate} disabled={busy || !dupName.trim()}>Duplicate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" disabled={!canEditActive || busy} onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </>
      )}
    </div>
  );
};
