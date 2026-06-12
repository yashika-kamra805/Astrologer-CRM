export default function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variants[variant]} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-32 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex gap-3 w-2/3">
          <Skeleton variant="rectangular" className="h-10 w-1/3" />
          <Skeleton variant="rectangular" className="h-10 w-1/4" />
        </div>
        <Skeleton variant="rectangular" className="h-10 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-slate-100">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                variant="text"
                className={cIdx === 0 ? 'w-1/4' : 'flex-1'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page Title skeleton */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* KPI skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="card flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="h-6 w-1/3" />
              <Skeleton variant="text" className="w-2/3" />
            </div>
            <Skeleton variant="circular" className="h-12 w-12 ml-4" />
          </div>
        ))}
      </div>

      {/* Main Grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1 space-y-4">
          <Skeleton variant="text" className="h-5 w-1/2" />
          <Skeleton variant="rectangular" className="h-24 w-full" />
          <Skeleton variant="rectangular" className="h-12 w-full" />
        </div>
        <div className="card lg:col-span-2 space-y-4">
          <Skeleton variant="text" className="h-5 w-1/3" />
          <TableSkeleton rows={3} cols={4} />
        </div>
      </div>
    </div>
  );
}
