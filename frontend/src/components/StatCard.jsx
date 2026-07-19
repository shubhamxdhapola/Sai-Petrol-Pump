export default function StatCard({ icon, label, value, hint, accent = 'blue', suffix }) {
  const palette = {
    blue: 'bg-blue-100 text-brand',
    green: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-500',
    purple: 'bg-violet-100 text-violet-600',
    red: 'bg-red-100 text-red-500',
  };

  return (
    <div className="soft-card flex min-h-[112px] items-center gap-5 p-5">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${palette[accent] || palette.blue}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-1 truncate text-lg font-bold text-ink sm:text-xl lg:text-2xl xl:text-base 2xl:text-xl" title={`${value}${suffix || ''}`}>
          {value}{suffix}
        </p>
        {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      </div>
    </div>
  );
}
