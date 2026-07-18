export default function Badge({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-brand',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-slate-100 text-slate-600',
    purple: 'bg-violet-100 text-violet-700',
  };
  return <span className={`badge ${tones[tone] || tones.gray}`}>{children}</span>;
}
