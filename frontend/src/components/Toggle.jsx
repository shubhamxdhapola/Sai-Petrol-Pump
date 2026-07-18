export default function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={`h-7 w-12 rounded-full p-1 transition ${checked ? 'bg-emerald-500' : 'bg-slate-400'}`}
      aria-pressed={checked}
    >
      <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}
