import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Calendar, Phone, Mail, User, MapPin, Clock, CalendarDays, Coins, FileText, Sparkles, Plus } from 'lucide-react';
import * as clientApi from '../services/clientApi';
import { formatDate, formatDateTime, formatCurrency, getErrorMessage } from '../../../lib/utils';
import { formatLabel } from '../../../constants/enums';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import Avatar from '../../../components/ui/Avatar';
import Spinner from '../../../components/feedback/Spinner';
import ErrorState from '../../../components/feedback/ErrorState';
import EmptyState from '../../../components/feedback/EmptyState';

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [clientRes, consultRes] = await Promise.all([
        clientApi.getClient(id),
        clientApi.getClientConsultations(id, { limit: 20, sortBy: 'consultationDate', order: 'desc' }),
      ]);
      setClient(clientRes.data.client);
      setConsultations(consultRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <Spinner className="py-24" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!client) return null;

  const pob = client.placeOfBirth || {};
  const fullAddress = [pob.city, pob.state, pob.country].filter(Boolean).join(', ') || '—';

  return (
    <div className="space-y-6">
      {/* Back button & top header profile */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Link to="/clients" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Avatar name={client.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight md:text-2xl">{client.name}</h2>
                <StatusBadge status={client.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Added {formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/clients/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          </Link>
          <Link to={`/consultations/new?clientId=${id}`}>
            <Button size="sm">
              <Calendar className="h-4 w-4" /> Log Session
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Client Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <Card title="Contact Information">
            <ul className="space-y-4 text-sm mt-3">
              <li className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> Phone
                </span>
                <span className="font-semibold text-slate-800">{client.phone}</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> Email
                </span>
                <span className="font-semibold text-slate-800 break-all pl-4 text-right">
                  {client.email || '—'}
                </span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Gender
                </span>
                <span className="font-semibold text-slate-800">
                  {formatLabel(client.gender) || '—'}
                </span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-slate-400" /> Lead Source
                </span>
                <span className="font-semibold text-slate-800">{client.source || '—'}</span>
              </li>
            </ul>
          </Card>

          {/* Birth Details */}
          <Card title="Birth Details">
            <ul className="space-y-4 text-sm mt-3">
              <li className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" /> Date of Birth
                </span>
                <span className="font-semibold text-slate-800">{formatDate(client.dateOfBirth)}</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" /> Time of Birth
                </span>
                <span className="font-semibold text-slate-800">{client.timeOfBirth || '—'}</span>
              </li>
              <li className="flex items-start justify-between py-1">
                <span className="text-slate-400 font-medium flex items-center gap-2 pt-0.5">
                  <MapPin className="h-4 w-4 text-slate-400" /> Place of Birth
                </span>
                <span className="font-semibold text-slate-800 text-right max-w-[150px] break-words">
                  {fullAddress}
                </span>
              </li>
            </ul>
          </Card>

          {/* Practice Stats */}
          <Card title="Engagement Stats">
            <ul className="space-y-4 text-sm mt-3">
              <li className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Logged Sessions</span>
                <span className="font-extrabold text-slate-900 text-base">{client.totalConsultations}</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium">Last Met On</span>
                <span className="font-semibold text-slate-700">
                  {client.lastConsultationAt ? formatDate(client.lastConsultationAt) : 'Never'}
                </span>
              </li>
            </ul>
          </Card>

          {/* Internal Notes */}
          {client.notes && (
            <Card title="General Notes">
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-650 leading-relaxed font-medium whitespace-pre-line">
                {client.notes}
              </div>
            </Card>
          )}
        </div>

        {/* Right column - Chronological timeline of consultations history */}
        <div className="lg:col-span-2">
          <Card
            title="Consultation Timeline"
            action={
              <Link to={`/consultations/new?clientId=${id}`}>
                <Button size="sm" className="shadow-sm">
                  <Plus className="h-4 w-4" /> New Session
                </Button>
              </Link>
            }
          >
            {consultations.length === 0 ? (
              <EmptyState
                title="No consultations logged yet"
                description="Use the button above to record your first consultation session with this client."
              />
            ) : (
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 my-4 space-y-8">
                {consultations.map((c) => (
                  <div key={c._id} className="relative group">
                    {/* Circle marker on vertical timeline */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-500 bg-white ring-4 ring-slate-50 group-hover:scale-110 transition-transform duration-200" />
                    
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-base">
                            {formatLabel(c.consultationType)}
                          </p>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                          {formatDateTime(c.consultationDate)}
                        </p>
                      </div>

                      {/* Financial info & status */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-slate-400" /> {formatCurrency(c.amount)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {c.duration} mins
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          Payment: <StatusBadge status={c.paymentStatus} />
                        </span>
                      </div>

                      {/* Notes & Recommendations logged inside this timeline card */}
                      {(c.notes || c.recommendations) && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100 space-y-2 text-sm">
                          {c.notes && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1 mb-0.5">
                                <FileText className="h-3 w-3" /> Session Notes
                              </p>
                              <p className="text-slate-600 leading-relaxed font-medium">{c.notes}</p>
                            </div>
                          )}
                          {c.recommendations && (
                            <div className="pt-2 border-t border-slate-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1 mb-0.5">
                                <Sparkles className="h-3 w-3" /> Prescriptions & Remedies
                              </p>
                              <p className="text-slate-700 leading-relaxed font-semibold">{c.recommendations}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
