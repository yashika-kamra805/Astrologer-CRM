import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import * as clientApi from '../services/clientApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../context/ToastContext';
import { formatDate, getErrorMessage } from '../../../lib/utils';
import { CLIENT_STATUSES, formatLabel } from '../../../constants/enums';
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
import ClientForm from '../components/ClientForm';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { toast } = useToast();

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await clientApi.getClients({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortBy: 'createdAt',
        order: 'desc',
      });
      setClients(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [debouncedSearch, status]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await clientApi.createClient(data);
      toast('Client created successfully', 'success');
      setModalOpen(false);
      load(1);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client? All their consultations logs will be affected.')) return;
    try {
      await clientApi.deleteClient(id);
      toast('Client successfully deleted', 'success');
      load(pagination.page);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and view your complete client list details</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="shadow-sm">
          <Plus className="h-4.5 w-4.5" /> Add Client
        </Button>
      </div>

      {/* Main card containing sticky filters and list */}
      <Card className="overflow-hidden">
        {/* Sticky filters bar */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur flex flex-col gap-3 sm:flex-row items-center justify-between">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by client name, email, phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            className="w-full sm:w-48 [&>select]:py-2 [&>select]:shadow-none"
            placeholder="All Client Statuses"
            options={CLIENT_STATUSES.map((s) => ({
              value: s,
              label: formatLabel(s),
            }))}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(pagination.page)} />
          ) : clients.length === 0 ? (
            <EmptyState
              title="No clients found"
              description="Try modifying your filters or add a new client to start tracking their consultations."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Client
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="-mx-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-55 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Client Info</th>
                      <th className="py-3 px-6">Phone Number</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-center">Consultations</th>
                      <th className="py-3 px-6">Added On</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clients.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} size="sm" />
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">
                                {c.name}
                              </p>
                              {c.email && <p className="text-xs text-slate-400 mt-0.5">{c.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-slate-500 font-medium">{c.phone}</td>
                        <td className="py-3 px-6">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-6 text-center text-slate-600 font-bold">
                          {c.totalConsultations}
                        </td>
                        <td className="py-3 px-6 text-slate-400 text-xs">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex justify-end gap-1">
                            <Link
                              to={`/clients/${c._id}`}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                              title="View client profile"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Link>
                            <Link
                              to={`/clients/${c._id}/edit`}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                              title="Edit client details"
                            >
                              <Pencil className="h-4.5 w-4.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(c._id)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-650 transition-colors"
                              title="Delete client"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Client" size="lg">
        <ClientForm onSubmit={handleCreate} loading={saving} submitLabel="Create Client Profile" />
      </Modal>
    </div>
  );
}
