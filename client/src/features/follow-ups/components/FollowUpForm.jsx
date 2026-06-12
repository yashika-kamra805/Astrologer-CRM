import { FOLLOW_UP_PRIORITIES, formatLabel } from '../../../constants/enums';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import { toInputDate } from '../../../lib/utils';

export default function FollowUpForm({
  initial = {},
  clients = [],
  onSubmit,
  loading,
  submitLabel = 'Save',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    data.dueDate = new Date(data.dueDate).toISOString();
    if (!data.description) data.description = null;
    if (!data.consultationId) data.consultationId = null;

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Client *"
          name="clientId"
          required
          placeholder="Select client"
          options={clients.map((c) => ({ value: c._id, label: `${c.name} (${c.phone})` }))}
          defaultValue={initial.clientId?._id || initial.clientId || ''}
        />
        <Input
          label="Title *"
          name="title"
          required
          defaultValue={initial.title || ''}
        />
        <Input
          label="Due Date *"
          name="dueDate"
          type="date"
          required
          defaultValue={toInputDate(initial.dueDate)}
        />
        <Select
          label="Priority"
          name="priority"
          options={FOLLOW_UP_PRIORITIES.map((p) => ({
            value: p,
            label: formatLabel(p),
          }))}
          defaultValue={initial.priority || 'medium'}
        />
      </div>
      <Textarea
        label="Description"
        name="description"
        defaultValue={initial.description || ''}
      />
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
