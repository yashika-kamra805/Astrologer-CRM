const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus:ring-brand-500/30 shadow-md shadow-brand-500/10 border border-brand-600 hover:border-brand-750',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100/80 focus:ring-brand-500/20 shadow-sm',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500/30 shadow-md shadow-rose-500/10 border border-rose-600',
  ghost: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100/80 focus:ring-brand-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5 font-medium',
  md: 'px-4 py-2.5 text-sm rounded-lg gap-2 font-medium',
  lg: 'px-5 py-3 text-sm rounded-xl gap-2.5 font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
