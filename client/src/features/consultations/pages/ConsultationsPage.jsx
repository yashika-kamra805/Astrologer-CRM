import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Calendar, Coins, Clock } from 'lucide-react';
import * as consultationApi from '../services/consultationApi';
import { useToast } from '../../../context/ToastContext';
import { formatDateTime, formatCurrency, getErrorMessage } from '../../../lib/utils';
import {
  CONSULTATION_TYPES,
  CONSULTATION_STATUSES,
  PAYMENT_STATUSES,
  formatLabel,
} from '../../../constants/enums';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Card from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import Avatar from '../../../components/ui/Avatar';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import ErrorState from '../../../components/feedback/ErrorState';
import EmptyState from '../../../components/feedback/EmptyState';

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    status: '',
    consultationType: '',
    paymentStatus: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await consultationApi.getConsultations({
        page,
        limit: 10,
        sortBy: 'consultationDate',
        order: 'desc',
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v)
        ),
      });
      setConsultations(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [filters]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this consultation log? This will update the client stats.')) return;
    try {
      await consultationApi.deleteConsultation(id);
      toast('Consultation log successfully deleted', 'success');
      load(pagination.page);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Consultation Sessions</h2>
          <p className="text-sm text-slate-500 mt-1">Log, schedule, and view detailed astrologer consultations</p>
        </div>
        <Link to="/consultations/new">
          <Button className="shadow-sm">
            <Plus className="h-4.5 w-4.5" /> Add Consultation
          </Button>
        </Link>
      </div>

      {/* Main card with list and filters */}
      <Card className="overflow-hidden">
        {/* Filters bar */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur grid gap-3 sm:grid-cols-3">
          <Select
            placeholder="All Session Statuses"
            options={CONSULTATION_STATUSES.map((s) => ({
              value: s,
              label: formatLabel(s),
            }))}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="[&>select]:shadow-none"
          />
          <Select
            placeholder="All Consultation Types"
            options={CONSULTATION_TYPES.map((t) => ({
              value: t,
              label: formatLabel(t),
            }))}
            value={filters.consultationType}
            onChange={(e) =>
              setFilters({ ...filters, consultationType: e.target.value })
            }
            className="[&>select]:shadow-none"
          />
          <Select
            placeholder="All Payment Statuses"
            options={PAYMENT_STATUSES.map((s) => ({
              value: s,
              label: formatLabel(s),
            }))}
            value={filters.paymentStatus}
            onChange={(e) =>
              setFilters({ ...filters, paymentStatus: e.target.value })
            }
            className="[&>select]:shadow-none"
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(pagination.page)} />
          ) : consultations.length === 0 ? (
            <EmptyState
              title="No consultations found"
              description="No consultation logs match your filter settings. Create a new log to get started."
              action={
                <Link to="/consultations/new">
                  <Button>
                    <Plus className="h-4 w-4" /> Add Consultation
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="-mx-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-55 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Date & Time</th>
                      <th className="py-3 px-6">Client Info</th>
                      <th className="py-3 px-6">Session Type</th>
                      <th className="py-3 px-6">Duration</th>
                      <th className="py-3 px-6">Amount</th>
                      <th className="py-3 px-6">Payment</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {consultations.map((c) => {
                      const clientName = c.clientId?.name || '—';
                      return (
                        <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span>{formatDateTime(c.consultationDate)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            {c.clientId ? (
                              <div className="flex items-center gap-2.5">
                                <Avatar name={clientName} size="xs" />
                                <Link
                                  to={`/clients/${c.clientId._id}`}
                                  className="font-semibold text-slate-800 hover:text-brand-600 transition-colors"
                                >
                                  {clientName}
                                </Link>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-medium">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-slate-550 font-medium">
                            {formatLabel(c.consultationType)}
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{c.duration} mins</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <Coins className="h-3.5 w-3.5 text-slate-400" />
                              <span>{formatCurrency(c.amount)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <StatusBadge status={c.paymentStatus} />
                          </td>
                          <td className="py-3.5 px-6">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex justify-end gap-1">
                              <Link
                                to={`/consultations/${c._id}/edit`}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                                title="Edit consultation"
                              >
                                <Pencil className="h-4 w-4 animate-scale" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(c._id)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-650 transition-colors"
                                title="Delete session"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={load}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
