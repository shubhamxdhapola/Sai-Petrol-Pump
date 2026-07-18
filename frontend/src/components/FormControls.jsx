import { FiChevronDown } from "react-icons/fi";

export function Field({ label, required, icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && <span className="text-red-500"> *</span>}</span>
      <div className="relative">
        {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-muted">{icon}</span>}
        <input className={`field ${icon ? '!pl-14' : ''}`} {...props} />
      </div>
    </label>
  );
}

export function SelectField({ label, required, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && <span className="text-red-500"> *</span>}</span>
      <div className="relative">
        <select className="field !appearance-none !pr-10" {...props}>
          {children}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted">
          <FiChevronDown />
        </div>
      </div>
    </label>
  );
}

export function TextArea({ label, required, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && <span className="text-red-500"> *</span>}</span>
      <textarea className="field min-h-24 resize-y" {...props} />
    </label>
  );
}
