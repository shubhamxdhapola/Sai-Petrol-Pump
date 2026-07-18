export default function ProgressBar({ value, color = 'bg-emerald-500', className = '' }) {
  return (
    <div className={`h-2 w-full rounded-full bg-slate-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
