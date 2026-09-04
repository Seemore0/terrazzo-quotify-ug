import { useState, useMemo } from 'react';
import { useQuotations, useUpdateQuotationStatus, useDuplicateQuotation, useUpdateQuotation, type QuoteStatus, type Quotation } from '@/hooks/useQuotations';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/presetTypes';
import { Search, Plus, FileText, MessageCircle, MoreVertical, Copy, Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { openWhatsApp } from '@/lib/nativeShare';
import { toast } from 'sonner';

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-muted text-foreground',
  sent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
  in_progress: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  completed: 'bg-primary/10 text-primary',
  archived: 'bg-muted text-muted-foreground',
};

const STATUSES: QuoteStatus[] = ['draft', 'sent', 'approved', 'in_progress', 'completed', 'rejected', 'archived'];
const statusLabel = (s: QuoteStatus) => s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1);

const Quotes = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuoteStatus | 'all' | 'active'>('active');
  const [editing, setEditing] = useState<Quotation | null>(null);
  const { data, isLoading } = useQuotations(status !== 'all' && status !== 'active' ? { status } : undefined);
  const updateStatus = useUpdateQuotationStatus();
  const duplicate = useDuplicateQuotation();
  const update = useUpdateQuotation();

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return (data ?? [])
      .filter(q => status !== 'active' ? true : q.status !== 'archived')
      .filter(q => !s || q.customer_name.toLowerCase().includes(s) ||
        q.quote_number.toLowerCase().includes(s) || q.customer_phone.includes(s));
  }, [data, search, status]);

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} quote{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link to="/"><Plus className="h-4 w-4 mr-1" />New Quote</Link>
        </Button>
      </div>

      <Card className="p-3 flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
          <Input placeholder="Search by name, phone or quote #" value={search}
            onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active (not archived)</SelectItem>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {isLoading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
      {!isLoading && filtered.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <div className="font-medium">No quotations here</div>
          <p className="text-sm text-muted-foreground mb-4">Create a quote or change the filter.</p>
          <Button asChild><Link to="/">Create Quote</Link></Button>
        </Card>
      )}

      <div className="grid gap-3">
        {filtered.map(q => (
          <Card key={q.id} className="p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{q.quote_number}</span>
                  <Badge className={statusColors[q.status]} variant="outline">{statusLabel(q.status)}</Badge>
                </div>
                <div className="font-semibold mt-1">{q.customer_name}</div>
                <div className="text-xs text-muted-foreground">
                  {q.customer_phone} • {Number(q.area_m2).toFixed(1)} m² • {new Date(q.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-primary">{formatCurrency(Number(q.total_cost))}</div>
                <div className="flex gap-1 mt-2 flex-wrap justify-end items-center">
                  <Select value={q.status} onValueChange={(v) =>
                    updateStatus.mutate({ id: q.id, status: v as QuoteStatus }, {
                      onSuccess: () => toast.success('Status updated'),
                    })
                  }>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => void openWhatsApp(q.customer_phone,
                    `Hi ${q.customer_name}, your terrazzo quotation ${q.quote_number} totals ${formatCurrency(Number(q.total_cost))}.`
                  ).catch(error => {
                    console.error('[whatsapp] Quote share failed', error);
                    toast.error('Could not open WhatsApp. You can use Share instead.');
                  })}>
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/?edit=${encodeURIComponent(q.id)}`)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />Edit full quote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditing(q)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />Edit details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicate.mutate(q.id, {
                        onSuccess: (nq) => toast.success(`Duplicated as ${nq.quote_number}`),
                        onError: (e: any) => toast.error(e.message),
                      })}>
                        <Copy className="h-3.5 w-3.5 mr-2" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {q.status === 'archived' ? (
                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: q.id, status: 'draft' }, {
                          onSuccess: () => toast.success('Restored to draft'),
                        })}>
                          <ArchiveRestore className="h-3.5 w-3.5 mr-2" />Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: q.id, status: 'archived' }, {
                          onSuccess: () => toast.success('Archived'),
                        })} className="text-destructive">
                          <Archive className="h-3.5 w-3.5 mr-2" />Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {editing?.quote_number}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Customer name</Label>
                <Input value={editing.customer_name} onChange={e => setEditing({ ...editing, customer_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={editing.customer_phone} onChange={e => setEditing({ ...editing, customer_phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={editing.customer_location ?? ''} onChange={e => setEditing({ ...editing, customer_location: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Area (m²)</Label>
                  <Input type="number" value={editing.area_m2 ?? 0} onChange={e => setEditing({ ...editing, area_m2: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Total cost (UGX)</Label>
                  <Input type="number" value={editing.total_cost ?? 0} onChange={e => setEditing({ ...editing, total_cost: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={editing.notes ?? ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={update.isPending} onClick={() => {
              if (!editing) return;
              update.mutate({
                id: editing.id,
                patch: {
                  customer_name: editing.customer_name,
                  customer_phone: editing.customer_phone,
                  customer_location: editing.customer_location,
                  area_m2: editing.area_m2,
                  total_cost: editing.total_cost,
                  notes: editing.notes,
                },
              }, {
                onSuccess: () => { toast.success('Updated'); setEditing(null); },
                onError: (e: any) => toast.error(e.message),
              });
            }}>{update.isPending ? 'Saving…' : 'Save changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;
