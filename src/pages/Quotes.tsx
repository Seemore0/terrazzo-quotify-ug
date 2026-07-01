import { useState, useMemo } from 'react';
import { useQuotations, useUpdateQuotationStatus, type QuoteStatus } from '@/hooks/useQuotations';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/presetTypes';
import { Search, Plus, FileText, MessageCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { toast } from 'sonner';

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-muted text-foreground',
  sent: 'bg-blue-500/10 text-blue-600',
  approved: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
  completed: 'bg-primary/10 text-primary',
  archived: 'bg-muted text-muted-foreground',
};

const Quotes = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuoteStatus | 'all'>('all');
  const { data, isLoading } = useQuotations(status !== 'all' ? { status } : undefined);
  const updateStatus = useUpdateQuotationStatus();

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return (data ?? []).filter(q =>
      !s || q.customer_name.toLowerCase().includes(s) || q.quote_number.toLowerCase().includes(s)
        || q.customer_phone.includes(s));
  }, [data, search]);

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
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {isLoading && <Card className="p-8 text-center text-muted-foreground">Loading…</Card>}
      {!isLoading && filtered.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <div className="font-medium">No quotations yet</div>
          <p className="text-sm text-muted-foreground mb-4">Create your first quote to get started.</p>
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
                  <Badge className={statusColors[q.status]} variant="outline">{q.status}</Badge>
                </div>
                <div className="font-semibold mt-1">{q.customer_name}</div>
                <div className="text-xs text-muted-foreground">
                  {q.customer_phone} • {Number(q.area_m2).toFixed(1)} m² • {new Date(q.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-primary">{formatCurrency(Number(q.total_cost))}</div>
                <div className="flex gap-1 mt-2 flex-wrap justify-end">
                  <Select value={q.status} onValueChange={(v) =>
                    updateStatus.mutate({ id: q.id, status: v as QuoteStatus }, {
                      onSuccess: () => toast.success('Status updated'),
                    })
                  }>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" asChild>
                    <a href={buildWhatsAppUrl(q.customer_phone,
                      `Hi ${q.customer_name}, your terrazzo quotation ${q.quote_number} totals ${formatCurrency(Number(q.total_cost))}.`)}
                      target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Quotes;
