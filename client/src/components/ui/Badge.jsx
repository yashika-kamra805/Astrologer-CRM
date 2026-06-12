const colors = {
  default: 'bg-slate-100/80 text-slate-600 border border-slate-200/60',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/50',
  warning: 'bg-amber-50 text-amber-850 border border-amber-200/60',
  danger: 'bg-rose-50/80 text-rose-700 border border-rose-200/60',
  info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
  brand: 'bg-brand-50 text-brand-700 border border-brand-200/60',
};

export default function Badge({ children, color = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${colors[color] || colors.default} ${className}`}
    >
      {children}
    </span>
  );
}
