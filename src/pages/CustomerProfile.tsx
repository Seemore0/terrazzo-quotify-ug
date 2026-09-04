import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '@/hooks/useCustomers';
import { useQuotations } from '@/hooks/useQuotations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/presetTypes';
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Plus, FileText } from 'lucide-react';
import { openWhatsApp } from '@/lib/nativeShare';
import { toast } from 'sonner';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id);
  const { data: quotes } = useQuotations({ customerId: id });

  if (isLoading) return <div className="text-center text-muted-foreground p-8">Loading…</div>;
  if (!customer) return (
    <div className="text-center p-8">
      <p className="text-muted-foreground mb-3">Customer not found</p>
      <Button asChild variant="outline"><Link to="/customers">Back to customers</Link></Button>
    </div>
  );

  return (
    <div className="space-y-4 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />Back
      </Button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{customer.phone}</div>
              {customer.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{customer.email}</div>}
              {customer.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{customer.location}</div>}
            </div>
            {customer.notes && <p className="text-sm mt-3 italic">"{customer.notes}"</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="bg-gradient-primary">
              <Link to="/"><Plus className="h-4 w-4 mr-1" />New Quote</Link>
            </Button>
            <Button variant="outline" onClick={() => void openWhatsApp(customer.phone, `Hello ${customer.name},`).catch(error => {
              console.error('[whatsapp] Customer share failed', error);
              toast.error('Could not open WhatsApp. You can use Share instead.');
            })}>
              <MessageCircle className="h-4 w-4 mr-1" />WhatsApp
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="text-xs uppercase text-muted-foreground">Projects</div><div className="text-2xl font-bold mt-1">{customer.total_projects}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-muted-foreground">Total Spent</div><div className="text-2xl font-bold text-primary mt-1">{formatCurrency(Number(customer.total_spent))}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-muted-foreground">Last Project</div><div className="text-lg font-semibold mt-1">{customer.last_project_date ? new Date(customer.last_project_date).toLocaleDateString() : '—'}</div></Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Quotation history</h2>
        {(!quotes || quotes.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            No quotations yet for this customer.
          </div>
        ) : (
          <div className="divide-y">
            {quotes.map(q => (
              <div key={q.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{q.quote_number}</span>
                    <Badge variant="outline">{q.status === 'in_progress' ? 'In Progress' : q.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(q.area_m2).toFixed(1)} m² • {new Date(q.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold text-primary">{formatCurrency(Number(q.total_cost))}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerProfile;
