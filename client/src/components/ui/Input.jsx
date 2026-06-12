import { useId } from 'react';

export default function Input({ label, error, className = '', id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${
          error
            ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/10'
            : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
