import {
  CONSULTATION_TYPES,
  CONSULTATION_STATUSES,
  PAYMENT_STATUSES,
  formatLabel,
} from '../../../constants/enums';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import { toInputDateTime } from '../../../lib/utils';

export default function ConsultationForm({
  initial = {},
  clients = [],
  onSubmit,
  loading,
  submitLabel = 'Save',
  lockClient = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    data.consultationDate = new Date(data.consultationDate).toISOString();
    data.duration = Number(data.duration);
    data.amount = Number(data.amount || 0);
    if (data.nextFollowUpDate) {
      data.nextFollowUpDate = new Date(data.nextFollowUpDate).toISOString();
    } else {
      data.nextFollowUpDate = null;
    }
    if (!data.notes) data.notes = null;
    if (!data.recommendations) data.recommendations = null;

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Block 1: Scheduling */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Session Scheduling
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Select Client *"
            name="clientId"
            required
            disabled={lockClient}
            placeholder="Search client database"
            options={clients.map((c) => ({ value: c._id, label: `${c.name} (${c.phone})` }))}
            defaultValue={initial.clientId?._id || initial.clientId || ''}
          />
          <Input
            label="Consultation Date & Time *"
            name="consultationDate"
            type="datetime-local"
            required
            defaultValue={toInputDateTime(initial.consultationDate)}
          />
          <Input
            label="Session Duration (minutes) *"
            name="duration"
            type="number"
            min={1}
            max={480}
            required
            defaultValue={initial.duration || 60}
            placeholder="e.g. 60"
          />
          <Select
            label="Session Topic/Type *"
            name="consultationType"
            required
            options={CONSULTATION_TYPES.map((t) => ({
              value: t,
              label: formatLabel(t),
            }))}
            defaultValue={initial.consultationType || 'general'}
          />
        </div>
      </div>

      {/* Block 2: Billing & Status */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Billing & Status
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Billing Amount (INR)"
            name="amount"
            type="number"
            min={0}
            defaultValue={initial.amount || 0}
            placeholder="e.g. 1500"
          />
          <Select
            label="Payment Status"
            name="paymentStatus"
            options={PAYMENT_STATUSES.map((s) => ({
              value: s,
              label: formatLabel(s),
            }))}
            defaultValue={initial.paymentStatus || 'pending'}
          />
          <Select
            label="Session Status"
            name="status"
            options={CONSULTATION_STATUSES.map((s) => ({
              value: s,
              label: formatLabel(s),
            }))}
            defaultValue={initial.status || 'scheduled'}
          />
        </div>
      </div>

      {/* Block 3: Timeline & Reminders */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Follow-Up Trigger
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Schedule Next Callback Date (Optional)"
            name="nextFollowUpDate"
            type="datetime-local"
            defaultValue={toInputDateTime(initial.nextFollowUpDate)}
          />
          <div className="flex items-center text-xs text-slate-400 font-medium pl-1 sm:pt-6">
            Scheduling a next callback date will automatically create a callback task in the Follow-Ups panel.
          </div>
        </div>
      </div>

      {/* Block 4: Notes and Remedies */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Astrological Notes & Prescriptions
        </h4>
        <div className="space-y-4">
          <Textarea
            label="Session Minutes / General Notes"
            name="notes"
            defaultValue={initial.notes || ''}
            placeholder="Write general chart insights, primary questions, client feedback..."
            rows={3}
          />
          <Textarea
            label="Astrological Recommendations & Remedies"
            name="recommendations"
            defaultValue={initial.recommendations || ''}
            placeholder="Specify gem recommendations, pooja, charts remedies, or custom exercises prescribed..."
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button type="submit" loading={loading} className="px-6">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
