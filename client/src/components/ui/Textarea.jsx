export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea
        className={`input min-h-[100px] resize-y ${error ? 'border-red-400' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
