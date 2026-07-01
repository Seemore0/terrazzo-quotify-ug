import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuotations } from '@/hooks/useQuotations';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/lib/presetTypes';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const downloadJson = (name: string, data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

const downloadCsv = (name: string, rows: Record<string, any>[]) => {
  if (!rows.length) return toast.error('Nothing to export');
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const { data: quotes } = useQuotations();
  const { data: customers } = useCustomers();

  const completed = (quotes ?? []).filter(q => q.status === 'completed');
  const revenue = completed.reduce((s, q) => s + Number(q.total_cost), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Reports & Exports</h1>
        <p className="text-sm text-muted-foreground">Download your business data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Quotes</div>
          <div className="text-2xl font-bold">{quotes?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Customers</div>
          <div className="text-2xl font-bold">{customers?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Revenue</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(revenue)}</div>
        </Card>
      </div>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Export data</h3>
        <p className="text-sm text-muted-foreground">Snapshot exports for accounting and backup.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => downloadCsv('quotations.csv',
            (quotes ?? []).map(q => ({
              quote_number: q.quote_number, date: q.created_at, customer: q.customer_name,
              phone: q.customer_phone, area_m2: q.area_m2, mode: q.work_mode,
              total: q.total_cost, status: q.status,
            })))}>
            <Download className="h-4 w-4 mr-1" />Quotes (CSV)
          </Button>
          <Button variant="outline" onClick={() => downloadCsv('customers.csv',
            (customers ?? []).map(c => ({
              name: c.name, phone: c.phone, email: c.email ?? '', location: c.location ?? '',
              total_projects: c.total_projects, total_spent: c.total_spent,
            })))}>
            <Download className="h-4 w-4 mr-1" />Customers (CSV)
          </Button>
          <Button variant="outline" onClick={() => downloadJson('backup.json', { quotes, customers })}>
            <Download className="h-4 w-4 mr-1" />Full backup (JSON)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
