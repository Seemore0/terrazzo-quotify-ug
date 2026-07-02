import { Card } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useQuotations';
import { formatCurrency } from '@/lib/presetTypes';
import { FileText, Users, TrendingUp, Wallet, Plus, Hammer, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
} from 'recharts';

const Stat = ({ icon: Icon, label, value, hint, loading }: any) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <div className="text-xs uppercase text-muted-foreground font-medium">{label}</div>
        {loading ? <Skeleton className="h-7 w-20 mt-1" /> : <div className="text-2xl font-bold mt-1 truncate">{value}</div>}
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </div>
      <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0"><Icon className="h-5 w-5" /></div>
    </div>
  </Card>
);

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#22c55e', '#f59e0b', '#ef4444', '#94a3b8', '#8b5cf6'];
const statusLabel = (s: string) => s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1);

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
        <Stat loading={isLoading} icon={FileText} label="Total Quotes" value={data?.totalQuotes ?? 0} hint={`${data?.monthQuotes ?? 0} this month`} />
        <Stat loading={isLoading} icon={Hammer} label="Active Projects" value={data?.activeProjects ?? 0} hint="In progress" />
        <Stat loading={isLoading} icon={CheckCircle2} label="Completed" value={data?.completedCount ?? 0} hint="All time" />
        <Stat loading={isLoading} icon={Clock} label="Pending" value={data?.pending ?? 0} hint="Draft / sent" />
        <Stat loading={isLoading} icon={Wallet} label="Revenue" value={formatCurrency(data?.revenue ?? 0)} hint="Completed jobs" />
        <Stat loading={isLoading} icon={TrendingUp} label="Pipeline" value={formatCurrency(data?.pipeline ?? 0)} hint="Not yet completed" />
        <Stat loading={isLoading} icon={Users} label="Customers" value={data?.customers ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Revenue (last 6 months)</h3>
          <div className="h-64">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer>
                <LineChart data={data?.monthly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} className="text-xs" />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="revenue" strokeWidth={2} stroke="hsl(var(--primary))" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Quotes per month</h3>
          <div className="h-64">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer>
                <BarChart data={data?.monthly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="quotes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Status distribution</h3>
          <div className="h-64">
            {isLoading ? <Skeleton className="h-full w-full" /> : (data?.statusDist?.length ?? 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No quotes yet</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data?.statusDist ?? []} dataKey="count" nameKey="status" innerRadius={40} outerRadius={80} paddingAngle={2}>
                    {(data?.statusDist ?? []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, statusLabel(String(n))]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend formatter={(v) => statusLabel(String(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recent quotations</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (data?.recent?.length ?? 0) === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No activity yet</div>
          ) : (
            <div className="divide-y">
              {data?.recent.map(q => (
                <Link key={q.id} to="/quotes" className="flex items-center justify-between py-2.5 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{q.quote_number}</span>
                      <Badge variant="outline" className="text-xs">{statusLabel(q.status)}</Badge>
                    </div>
                    <div className="text-sm mt-0.5 truncate">{q.customer_name}</div>
                  </div>
                  <div className="text-sm font-semibold text-primary">{formatCurrency(Number(q.total_cost))}</div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
