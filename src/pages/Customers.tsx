import { useState, useMemo } from 'react';
import { useCustomers, useArchiveCustomer, useUpsertCustomer } from '@/hooks/useCustomers';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/presetTypes';
import { Search, Plus, Users, Phone, MapPin, Trash2, MessageCircle } from 'lucide-react';
import { customerSchema } from '@/lib/schemas';
import { toast } from 'sonner';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

const emptyForm = { name: '', phone: '', email: '', location: '', notes: '' };

const Customers = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { data, isLoading } = useCustomers();
  const upsert = useUpsertCustomer();
  const archive = useArchiveCustomer();

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return (data ?? []).filter(c => !s ||
      c.name.toLowerCase().includes(s) || c.phone.includes(s) ||
      c.location?.toLowerCase().includes(s));
  }, [data, search]);

  const handleSubmit = () => {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    upsert.mutate(parsed.data as any, {
      onSuccess: () => { toast.success('Customer saved'); setOpen(false); setForm(emptyForm); },
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" />Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {(['name', 'phone', 'email', 'location'] as const).map(f => (
                <div key={f} className="space-y-1.5">
                  <Label className="capitalize">{f}</Label>
                  <Input value={(form as any)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })}
                    inputMode={f === 'phone' ? 'tel' : undefined} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={upsert.isPending}>
                {upsert.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
          <Input placeholder="Search by name, phone or location" value={search}
            onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
      </Card>

      {isLoading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
      {!isLoading && filtered.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <div className="font-medium">No customers yet</div>
          <p className="text-sm text-muted-foreground">Customers are added automatically when you create quotes.</p>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => (
          <Card key={c.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" /> {c.phone}
                </div>
                {c.location && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {c.location}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => archive.mutate(c.id, { onSuccess: () => toast.success('Archived') })}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <div>
                <div className="text-xs text-muted-foreground">Projects</div>
                <div className="font-medium">{c.total_projects}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total spent</div>
                <div className="font-medium text-primary">{formatCurrency(Number(c.total_spent))}</div>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="w-full">
              <a href={buildWhatsAppUrl(c.phone, `Hello ${c.name},`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
              </a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Customers;
