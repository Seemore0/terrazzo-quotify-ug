import { Card } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useQuotations';
import { formatCurrency } from '@/lib/presetTypes';
import { FileText, Users, TrendingUp, Wallet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const Stat = ({ icon: Icon, label, value, hint }: any) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase text-muted-foreground font-medium">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </div>
      <div className="p-2 rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
    </div>
  </Card>
);

const Dashboard = () => {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your quotation pipeline</p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link to="/"><Plus className="h-4 w-4 mr-1" />New Quote</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={FileText} label="Total Quotes" value={isLoading ? '…' : data?.totalQuotes ?? 0}
          hint={`${data?.monthQuotes ?? 0} this month`} />
        <Stat icon={Users} label="Customers" value={isLoading ? '…' : data?.customers ?? 0} />
        <Stat icon={Wallet} label="Revenue" value={isLoading ? '…' : formatCurrency(data?.revenue ?? 0)}
          hint="Completed jobs" />
        <Stat icon={TrendingUp} label="Pipeline" value={isLoading ? '…' : formatCurrency(data?.pipeline ?? 0)}
          hint="Draft / sent / approved" />
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Revenue (last 6 months)</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data?.monthly ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} className="text-xs" />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="revenue" strokeWidth={2} stroke="hsl(var(--primary))" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
