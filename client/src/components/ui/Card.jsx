export default function Card({ title, action, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
