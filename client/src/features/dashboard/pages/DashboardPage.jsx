import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Bell,
  IndianRupee,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import * as dashboardApi from '../services/dashboardApi';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, formatDate, getErrorMessage } from '../../../lib/utils';
import { formatLabel } from '../../../constants/enums';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/feedback/Spinner';
import ErrorState from '../../../components/feedback/ErrorState';
import EmptyState from '../../../components/feedback/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

function KpiCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="card flex items-start justify-between bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500 font-medium">{sub}</p>}
      </div>
      <div className={`rounded-lg p-2.5 ${color} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [charts, setCharts] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, revenueRes, recentRes, upcomingRes, chartsRes] =
        await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRevenue(),
          dashboardApi.getRecentConsultations(),
          dashboardApi.getUpcomingFollowUps(),
          dashboardApi.getCharts(),
        ]);
      
      setStats(statsRes?.data?.stats || null);
      setRevenue(revenueRes?.data?.revenue || null);
      setRecent(recentRes?.data?.consultations || []);
      setUpcoming(upcomingRes?.data?.followUps || []);
      setCharts(chartsRes?.data?.charts || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  // Optional chaining safety checks
  const totalClients = stats?.totalClients ?? 0;
  const activeClients = stats?.activeClients ?? 0;
  const totalConsultations = stats?.totalConsultations ?? 0;
  const consultationsThisMonth = stats?.consultationsThisMonth ?? 0;
  const pendingFollowUps = stats?.pendingFollowUps ?? 0;
  const overdueFollowUps = stats?.overdueFollowUps ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const revenueThisMonth = stats?.revenueThisMonth ?? 0;

  const revenueThisMonthDetail = revenue?.revenueThisMonth ?? 0;
  const revenueLastMonthDetail = revenue?.revenueLastMonth ?? 0;
  const growth = revenue?.revenueGrowthPercentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Refresh Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome back, {user?.name || 'Astrologer'}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Practice Overview: You have <strong className="text-slate-800">{totalClients}</strong> total clients,{' '}
            <strong className="text-slate-800">{pendingFollowUps}</strong> pending follow-ups, and{' '}
            <strong className="text-slate-800">{formatCurrency(revenueThisMonth)}</strong> revenue this month.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={load}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </Button>
      </div>

      {/* Quick Action Grid - standard college project style */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Quick Actions:</span>
        <Link to="/clients">
          <Button size="sm" variant="secondary" className="flex items-center gap-1 bg-white">
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        </Link>
        <Link to="/consultations/new">
          <Button size="sm" variant="secondary" className="flex items-center gap-1 bg-white">
            <Plus className="h-4 w-4" /> Log Consultation
          </Button>
        </Link>
        <Link to="/follow-ups">
          <Button size="sm" variant="secondary" className="flex items-center gap-1 bg-white">
            <Plus className="h-4 w-4" /> Create Follow-up
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Clients"
          value={totalClients}
          sub={`${activeClients} active clients`}
          icon={Users}
          color="bg-blue-500"
        />
        <KpiCard
          title="Consultations"
          value={totalConsultations}
          sub={`${consultationsThisMonth} this month`}
          icon={Calendar}
          color="bg-brand-600"
        />
        <KpiCard
          title="Follow-Ups"
          value={pendingFollowUps + overdueFollowUps}
          sub={`${overdueFollowUps} overdue reminders`}
          icon={Bell}
          color="bg-amber-500"
        />
        <KpiCard
          title="Revenue (Month)"
          value={formatCurrency(revenueThisMonth)}
          sub={`${formatCurrency(totalRevenue)} total revenue`}
          icon={IndianRupee}
          color="bg-emerald-500"
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Summary Card */}
        <Card
  title="Revenue Summary"
  className="w-full overflow-hidden lg:col-span-1 border border-slate-200"
>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">This Month</p>
              <p className="text-2xl font-bold mt-1 text-slate-800">{formatCurrency(revenueThisMonthDetail)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Last Month</p>
              <p className="text-lg font-semibold mt-1 text-slate-700">{formatCurrency(revenueLastMonthDetail)}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-55 text-red-700'}`}>
                {growth >= 0 ? '+' : ''}{growth}% growth
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          </div>
        </Card>

        {/* Recent Consultations Card */}
        <Card
  title="Recent Consultations"
  className="w-full overflow-hidden lg:col-span-2 border border-slate-200"
>
          {recent.length === 0 ? (
            <EmptyState
              title="No consultations yet"
              description="Record a consultation session to see history."
              action={
                <Link to="/consultations/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Log Consultation
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 font-semibold text-xs">Client</th>
                    <th className="pb-3 font-semibold text-xs">Session Type</th>
                    <th className="pb-3 font-semibold text-xs">Amount</th>
                    <th className="pb-3 font-semibold text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((c) => (
                    <tr key={c?._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">{c?.clientName || '—'}</td>
                      <td className="py-3 text-slate-655">{formatLabel(c?.consultationType)}</td>
                      <td className="py-3 font-semibold text-slate-900">{formatCurrency(c?.amount || 0)}</td>
                      <td className="py-3">
                        <StatusBadge status={c?.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Reminders Card */}
      <Card title="Upcoming Follow-Ups" className="border border-slate-200">
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming follow-ups"
            description="Create callback follow-ups to track client outreach."
            action={
              <Link to="/follow-ups">
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Create Follow-up
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((f) => (
              <div
                key={f?._id}
                className="rounded-xl border border-slate-200 p-4 bg-white hover:border-brand-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{f?.title || '—'}</p>
                    <StatusBadge status={f?.priority} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Client: {f?.clientName || '—'}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-150 flex items-center justify-between text-xs text-slate-400">
                  <span>Due date</span>
                  <span className="font-medium text-slate-600">{f?.dueDate ? formatDate(f.dueDate) : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Monthly Consultations Chart */}
        <Card title="Monthly Consultations" className="border border-slate-200">
          {!charts?.monthlyConsultations || charts.monthlyConsultations.length === 0 ? (
            <EmptyState title="No monthly consultations data" />
          ) : (
            <div className="h-48 sm:h-56 lg:h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyConsultations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Monthly Revenue Chart */}
        <Card title="Monthly Revenue" className="border border-slate-200">
          {!charts?.monthlyRevenue || charts.monthlyRevenue.length === 0 ? (
            <EmptyState title="No monthly revenue data" />
          ) : (
            <div className="h-48 sm:h-56 lg:h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Follow-Ups by Status Pie Chart */}
        <Card title="Follow-Ups by Status" className="border border-slate-200">
          {!charts?.followUpsByStatus || charts.followUpsByStatus.filter(d => d?.count > 0).length === 0 ? (
            <EmptyState title="No follow-up statuses data" />
          ) : (
            <div className="h-48 sm:h-56 lg:h-64 mt-4 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.followUpsByStatus.filter((d) => d?.count > 0)}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ status, count }) => `${formatLabel(status)}: ${count}`}
                  >
                    {charts.followUpsByStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Consultation Types Chart */}
        <Card title="Consultation Types" className="border border-slate-200">
          {!charts?.consultationTypes || charts.consultationTypes.length === 0 ? (
            <EmptyState title="No consultation types data" />
          ) : (
            <div className="h-48 sm:h-56 lg:h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.consultationTypes} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    width={90}
                    tickFormatter={formatLabel}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
