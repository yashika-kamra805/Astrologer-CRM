export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'border-red-400' : ''}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
