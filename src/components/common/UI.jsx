import { Loader2, Search, X, AlertTriangle, Plus, ChevronDown } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, error, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

export function Input(props) { return <input {...props} className={`field ${props.className || ""}`} />; }
export function Textarea(props) { return <textarea {...props} className={`field min-h-24 resize-y ${props.className || ""}`} />; }
export function Select({ options = [], placeholder = "Select", className = "", ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`field appearance-none pr-10 ${className}`}>
        {placeholder !== null && <option value="">{placeholder}</option>}
        {options.map((item) => typeof item === "string"
          ? <option key={item} value={item}>{item}</option>
          : <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field pl-11" />
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, size = "max-w-2xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className={`max-h-[92vh] w-full ${size} overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div><h2 className="text-xl font-bold text-slate-950">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Confirm action", description, confirmText = "Confirm", danger = false, busy = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="max-w-md">
      <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${danger ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"}`}><AlertTriangle size={20} /></div>
        <p className="text-sm leading-6 text-slate-600">{description || "This action cannot be undone."}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? "btn-danger" : "btn-primary"} disabled={busy} onClick={onConfirm}>{busy && <Loader2 size={16} className="animate-spin" />}{confirmText}</button>
      </div>
    </Modal>
  );
}

export function LoadingBlock({ label = "Loading..." }) {
  return <div className="panel flex min-h-48 items-center justify-center gap-3 p-8 text-sm font-medium text-slate-500"><Loader2 className="animate-spin text-indigo-600" size={20} />{label}</div>;
}

export function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Plus size={24} /></div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  generated: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  submitted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
  invoiced: "bg-violet-50 text-violet-700 ring-violet-600/20"
};

export function StatusBadge({ value }) {
  const key = String(value || "unknown").toLowerCase();
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusStyles[key] || "bg-slate-100 text-slate-600 ring-slate-500/20"}`}>{key.replace(/_/g, " ")}</span>;
}

export function StatCard({ label, value, helper, icon: Icon, accent = "indigo" }) {
  const accents = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-600",
    cyan: "bg-cyan-50 text-cyan-700"
  };
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div><div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</div><div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</div>{helper && <div className="mt-2 text-xs text-slate-500">{helper}</div>}</div>
        {Icon && <div className={`grid h-11 w-11 place-items-center rounded-2xl ${accents[accent] || accents.indigo}`}><Icon size={20} /></div>}
      </div>
    </div>
  );
}

export function FilterBar({ children }) { return <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>; }

export function TableShell({ children }) { return <div className="table-wrap overflow-x-auto">{children}</div>; }

export function PrimaryButton({ children, icon: Icon, ...props }) { return <button {...props} className={`btn-primary ${props.className || ""}`}>{Icon && <Icon size={17} />}{children}</button>; }
export function SecondaryButton({ children, icon: Icon, ...props }) { return <button type={props.type || "button"} {...props} className={`btn-secondary ${props.className || ""}`}>{Icon && <Icon size={17} />}{children}</button>; }
export function DangerButton({ children, icon: Icon, ...props }) { return <button type={props.type || "button"} {...props} className={`btn-danger ${props.className || ""}`}>{Icon && <Icon size={17} />}{children}</button>; }
