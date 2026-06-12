import { CLIENT_STATUSES, GENDERS, formatLabel } from '../../../constants/enums';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import { toInputDate } from '../../../lib/utils';

export default function ClientForm({ initial = {}, onSubmit, loading, submitLabel = 'Save' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
    if (!data.email) data.email = null;
    if (!data.gender) data.gender = null;
    if (!data.timeOfBirth) data.timeOfBirth = null;
    if (!data.source) data.source = null;
    if (!data.notes) data.notes = null;

    data.placeOfBirth = {
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
    };
    delete data.city;
    delete data.state;
    delete data.country;

    onSubmit(data);
  };

  const pob = initial.placeOfBirth || {};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group 1: Personal Information */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Personal Information
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name *" name="name" required defaultValue={initial.name} placeholder="Full Name" />
          <Input label="Phone Number *" name="phone" required defaultValue={initial.phone} placeholder="e.g. +91 99999 88888" />
          <Input label="Email Address" name="email" type="email" defaultValue={initial.email || ''} placeholder="example@gmail.com" />
          <Select
            label="Gender"
            name="gender"
            placeholder="Select gender"
            options={GENDERS.map((g) => ({ value: g, label: formatLabel(g) }))}
            defaultValue={initial.gender || ''}
          />
          <Select
            label="Client Status"
            name="status"
            options={CLIENT_STATUSES.map((s) => ({ value: s, label: formatLabel(s) }))}
            defaultValue={initial.status || 'lead'}
          />
          <Input label="Acquisition Source" name="source" defaultValue={initial.source || ''} placeholder="e.g. Website, Reference" />
        </div>
      </div>

      {/* Group 2: Birth Details */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Birth details (Kundli chart info)
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            defaultValue={toInputDate(initial.dateOfBirth)}
          />
          <Input
            label="Time of Birth"
            name="timeOfBirth"
            placeholder="e.g. 14:45 or HH:MM"
            defaultValue={initial.timeOfBirth || ''}
          />
          <Input label="Birth City" name="city" defaultValue={pob.city || ''} placeholder="e.g. Mumbai" />
          <Input label="Birth State" name="state" defaultValue={pob.state || ''} placeholder="e.g. Maharashtra" />
          <Input label="Birth Country" name="country" defaultValue={pob.country || ''} placeholder="e.g. India" />
        </div>
      </div>

      {/* Group 3: Notes */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-slate-100 pb-1.5">
          Internal Notes & Background
        </h4>
        <Textarea label="General Profile Notes" name="notes" defaultValue={initial.notes || ''} placeholder="Write any specific background notes, primary concerns, or astrological charts characteristics..." />
      </div>

      {/* Form Submit actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button type="submit" loading={loading} className="px-6">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
