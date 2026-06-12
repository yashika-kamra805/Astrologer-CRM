import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
