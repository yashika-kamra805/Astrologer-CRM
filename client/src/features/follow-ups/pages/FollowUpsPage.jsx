import { useEffect, useState } from 'react';
import { Plus, CheckCircle, Trash2, Calendar, AlertTriangle, Check, UserPlus } from 'lucide-react';
import * as followUpApi from '../services/followUpApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../context/ToastContext';
import { formatDate, getErrorMessage } from '../../../lib/utils';
import { FOLLOW_UP_STATUSES, FOLLOW_UP_PRIORITIES, formatLabel } from '../../../constants/enums';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Card from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import Avatar from '../../../components/ui/Avatar';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import ErrorState from '../../../components/feedback/ErrorState';
import EmptyState from '../../../components/feedback/EmptyState';
import Modal from '../../../components/ui/Modal';
import FollowUpForm from '../components/FollowUpForm';
import * as clientApi from '../../clients/services/clientApi';
import Textarea from '../../../components/ui/Textarea';

const TABS = [
  { key: 'all', label: 'All Reminders' },
  { key: 'upcoming', label: 'Upcoming (60 Days)' },
  { key: 'overdue', label: 'Overdue Alerts' },
];

export default function FollowUpsPage() {
  const [tab, setTab] = useState('all');
  const [followUps, setFollowUps] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { toast } = useToast();

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      let res;
      const params = { page, limit: 10 };

      if (tab === 'upcoming') {
        res = await followUpApi.getUpcomingFollowUps({ ...params, days: 60 });
      } else if (tab === 'overdue') {
        res = await followUpApi.getOverdueFollowUps(params);
      } else {
        res = await followUpApi.getFollowUps({
          ...params,
          search: debouncedSearch || undefined,
          status: status || undefined,
          priority: priority || undefined,
          sortBy: 'dueDate',
          order: 'asc',
        });
      }

      setFollowUps(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [tab, debouncedSearch, status, priority]);

  useEffect(() => {
    clientApi.getClients({ limit: 100 }).then((res) => setClients(res.data));
  }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await followUpApi.createFollowUp(data);
      toast('Follow-up created successfully', 'success');
      setModalOpen(false);
      load(1);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await followUpApi.completeFollowUp(completeModal, {
        completionNotes: completionNotes || null,
      });
      toast('Follow-up completed successfully', 'success');
      setCompleteModal(null);
      setCompletionNotes('');
      load(pagination.page);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      await followUpApi.deleteFollowUp(id);
      toast('Follow-up successfully deleted', 'success');
      load(pagination.page);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  // Priority color accents maps
  const borderClasses = {
    high: 'border-l-4 border-l-rose-500 bg-rose-50/5 hover:border-l-rose-600',
    medium: 'border-l-4 border-l-amber-500 bg-amber-50/5 hover:border-l-amber-600',
    low: 'border-l-4 border-l-slate-350 hover:border-l-slate-400',
  };

  const cardClasses = (item) => {
    const isCompleted = item.status === 'completed';
    const isOverdue = new Date(item.dueDate) < new Date() && !isCompleted;
    
    let base = 'card card-interactive flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ';
    
    if (isCompleted) {
      return base + 'opacity-70 bg-slate-50 border-slate-100 border-l-4 border-l-slate-300';
    }
    if (isOverdue) {
      return base + 'border-red-200 bg-red-50/10 border-l-4 border-l-red-500 hover:border-red-300';
    }
    
    return base + (borderClasses[item.priority] || 'border-slate-100');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-Ups</h2>
          <p className="text-sm text-slate-500 mt-1">Track callbacks, task reminders, and charts recommendations</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="shadow-sm">
          <Plus className="h-4.5 w-4.5" /> Add Follow-Up
        </Button>
      </div>

      {/* Tabs navigation */}
      <div className="flex p-1 gap-1 rounded-xl bg-slate-100/80 max-w-lg">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 text-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
              tab === t.key
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Container Card */}
      <Card>
        {/* Filters shown only when looking at all reminders */}
        {tab === 'all' && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3 border-b border-slate-100 pb-5">
            <input
              className="input [&>input]:shadow-none"
              placeholder="Search title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              placeholder="All Statuses"
              options={FOLLOW_UP_STATUSES.map((s) => ({
                value: s,
                label: formatLabel(s),
              }))}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="[&>select]:shadow-none"
            />
            <Select
              placeholder="All Priorities"
              options={FOLLOW_UP_PRIORITIES.map((p) => ({
                value: p,
                label: formatLabel(p),
              }))}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="[&>select]:shadow-none"
            />
          </div>
        )}

        <div>
          {loading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(pagination.page)} />
          ) : followUps.length === 0 ? (
            <EmptyState
              title={`No follow-ups found in "${TABS.find((t) => t.key === tab).label}"`}
              description="Enjoy a clear inbox! Create a callback reminder to track client interactions."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Follow-Up
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {followUps.map((f) => {
                  const isCompleted = f.status === 'completed';
                  const isOverdue = new Date(f.dueDate) < new Date() && !isCompleted;
                  return (
                    <div key={f._id} className={cardClasses(f)}>
                      {/* Left: Metadata details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className={`font-bold text-base leading-tight ${isCompleted ? 'text-slate-450 line-through' : 'text-slate-800'}`}>
                            {f.title}
                          </h4>
                          <StatusBadge status={f.status} />
                          <StatusBadge status={f.priority} />
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-650 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5 animate-pulse">
                              <AlertTriangle className="h-3 w-3" /> Overdue
                            </span>
                          )}
                        </div>

                        {/* Client details & Due Date */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
                          {f.clientId ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={f.clientId.name} size="xs" />
                              <span>{f.clientId.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>Due Date: {formatDate(f.dueDate)}</span>
                          </span>
                        </div>

                        {/* Description */}
                        {f.description && (
                          <p className={`text-sm leading-relaxed ${isCompleted ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
                            {f.description}
                          </p>
                        )}

                        {/* Completed notes */}
                        {isCompleted && f.completionNotes && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200/40">
                            <span className="block uppercase text-[10px] text-slate-400 font-bold mb-1">Completion logs:</span>
                            {f.completionNotes}
                          </div>
                        )}
                      </div>

                      {/* Right: Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0">
                        {!isCompleted && f.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setCompleteModal(f._id)}
                            className="shadow-sm w-full sm:w-auto font-semibold hover:border-emerald-500 hover:text-emerald-700"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" /> Complete
                          </Button>
                        )}
                        {isCompleted && (
                          <span className="p-2 rounded-full bg-emerald-50 text-emerald-600" title="Completed Task">
                            <Check className="h-5 w-5" />
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(f._id)}
                          className="hover:bg-rose-50 hover:text-rose-600 p-2.5"
                          title="Delete follow-up"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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

      {/* Add Follow-Up Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Follow-Up Task" size="lg">
        <FollowUpForm
          clients={clients}
          onSubmit={handleCreate}
          loading={saving}
          submitLabel="Schedule Task"
        />
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        open={Boolean(completeModal)}
        onClose={() => setCompleteModal(null)}
        title="Complete Follow-Up"
      >
        <div className="space-y-4">
          <Textarea
            label="Astrologer Completion Notes (Optional)"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Write brief outcome of the callback, client response, or notes for next logs..."
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
            <Button variant="secondary" onClick={() => setCompleteModal(null)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleComplete}>
              Mark Completed
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
