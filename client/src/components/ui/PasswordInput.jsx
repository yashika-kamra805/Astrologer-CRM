import { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ label, error, className = '', id, ...props }) {
  const [show, setShow] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={show ? 'text' : 'password'}
          className={`input pr-10 ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/10'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:text-brand-500 focus:outline-none"
          tabIndex={0}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
