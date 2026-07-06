import { useEffect, useRef, useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";

export interface DateRangeValue {
  from: string;
  to: string;
}

const formatDate = (value: string) => {
  if (!value) return "Chọn ngày";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const toInputDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export function DateRangePicker({ value, onChange }: { value: DateRangeValue; onChange: (value: DateRangeValue) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const selectLastDays = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days + 1);
    onChange({ from: toInputDate(from), to: toInputDate(to) });
    setOpen(false);
  };

  const invalid = Boolean(value.from && value.to && value.from > value.to);

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-border bg-white px-3 text-sm text-slate-700 shadow-sm hover:border-slate-300 sm:w-64"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarRange size={17} className="shrink-0 text-primary" />
          <span className="truncate">{formatDate(value.from)} – {formatDate(value.to)}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="dialog" aria-label="Chọn khoảng ngày" className="absolute right-0 z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-border bg-white p-4 shadow-xl">
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => selectLastDays(7)} className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">7 ngày qua</button>
            <button type="button" onClick={() => selectLastDays(30)} className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">30 ngày qua</button>
            <button type="button" onClick={() => selectLastDays(90)} className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">90 ngày qua</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-slate-600">
              Từ ngày
              <input type="date" value={value.from} max={value.to || undefined} onChange={(event) => onChange({ ...value, from: event.target.value })} className="h-10 min-w-0 rounded-md border border-border px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-slate-600">
              Đến ngày
              <input type="date" value={value.to} min={value.from || undefined} onChange={(event) => onChange({ ...value, to: event.target.value })} className="h-10 min-w-0 rounded-md border border-border px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>
          {invalid && <p className="mt-2 text-xs text-red-600">Ngày bắt đầu không được sau ngày kết thúc.</p>}
          <div className="mt-4 flex justify-end">
            <button type="button" disabled={invalid || !value.from || !value.to} onClick={() => setOpen(false)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Áp dụng</button>
          </div>
        </div>
      )}
    </div>
  );
}
