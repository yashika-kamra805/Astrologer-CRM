import Badge from './Badge';
import { formatLabel } from '../../constants/enums';

const statusColors = {
  active: 'success',
  completed: 'success',
  paid: 'success',
  lead: 'info',
  pending: 'warning',
  scheduled: 'info',
  overdue: 'danger',
  cancelled: 'default',
  inactive: 'default',
  no_show: 'danger',
  waived: 'default',
  high: 'danger',
  medium: 'warning',
  low: 'default',
};

const dotColors = {
  active: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  paid: 'bg-emerald-500',
  lead: 'bg-sky-500',
  pending: 'bg-amber-550',
  scheduled: 'bg-sky-500',
  overdue: 'bg-rose-500',
  cancelled: 'bg-slate-400',
  inactive: 'bg-slate-450',
  no_show: 'bg-rose-500',
  waived: 'bg-slate-400',
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
};

export default function StatusBadge({ status }) {
  const dotColor = dotColors[status] || 'bg-slate-400';
  return (
    <Badge color={statusColors[status] || 'default'} className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{formatLabel(status)}</span>
    </Badge>
  );
}
