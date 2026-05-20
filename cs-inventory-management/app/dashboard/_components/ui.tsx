import type { Dispatch, SetStateAction } from "react";
import type { Item, Toast, Transaction } from "./types";

export const categories = ["Computers", "Networking", "Lab Equipment", "Accessories", "Furniture", "General"];
const palette = ["#3b82f6", "#10b981", "#f59e0b", "#6d5dfc", "#e65f8c", "#64748b"];

export function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {action && <button className="accent-text text-sm font-semibold" type="button">{action}</button>}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-600">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function MetricMini({ label, value, tone = "indigo" }: { label: string; value: number; tone?: "indigo" | "green" | "orange" }) {
  const color = tone === "green" ? "text-emerald-600" : tone === "orange" ? "text-orange-500" : "accent-text";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function MetricCard({ label, value, helper, color }: { label: string; value: number; helper: string; color: "indigo" | "green" | "orange" | "red" }) {
  const styles = {
    indigo: "accent-soft-bg accent-text",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-500",
    red: "bg-red-50 text-red-500",
  }[color];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="flex items-center gap-5">
        <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-full text-3xl font-bold ${styles}`}>{label[0]}</div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
      </div>
    </div>
  );
}

export function Donut({ categories: values }: { categories: Record<string, number> }) {
  const entries = Object.entries(values).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let offset = 25;
  const segments = entries.map(([category, value], index) => {
    const dash = total ? (value / total) * 100 : 0;
    const segment = <circle key={category} cx="90" cy="90" r="62" fill="none" stroke={palette[index % palette.length]} strokeWidth="28" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={offset} />;
    offset -= dash;
    return segment;
  });

  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r="62" fill="none" stroke="#e5e7eb" strokeWidth="28" />
        {segments}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
      </div>
    </div>
  );
}

export function CategoryLegend({ categories: values }: { categories: Record<string, number> }) {
  const entries = Object.entries(values);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!entries.length) return <p className="self-center text-sm text-slate-500">No category data yet.</p>;
  return (
    <div className="self-center space-y-3">
      {entries.map(([category, value], index) => (
        <div key={category} className="flex items-start gap-3">
          <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
          <div>
            <p className="font-semibold">{category}</p>
            <p className="text-sm text-slate-500">{value} ({total ? Math.round((value / total) * 100) : 0}%)</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AddItemTab({
  formState,
  setFormState,
  onSubmit,
  busy,
}: {
  formState: { name: string; category: string; quantity: number; lowStockThreshold: number; description: string };
  setFormState: Dispatch<SetStateAction<{ name: string; category: string; quantity: number; lowStockThreshold: number; description: string }>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  return (
    <Panel title="Add Item">
      <p className="mb-6 text-sm text-slate-500">Use this tab to add inventory items, set thresholds, and store item details.</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Item Name">
          <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} className="form-input" placeholder="Item name" required />
        </Field>
        <Field label="Category">
          <select value={formState.category} onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))} className="form-input">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantity">
            <input type="number" min={1} value={formState.quantity} onChange={(event) => setFormState((prev) => ({ ...prev, quantity: Number(event.target.value) }))} className="form-input" required />
          </Field>
          <Field label="Low Stock Alert">
            <input type="number" min={1} value={formState.lowStockThreshold} onChange={(event) => setFormState((prev) => ({ ...prev, lowStockThreshold: Number(event.target.value) }))} className="form-input" required />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} className="form-input min-h-24" placeholder="Optional details" />
        </Field>
        <button type="submit" disabled={busy} className="accent-bg w-full rounded-md px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Saving..." : "Save Item"}
        </button>
      </form>
    </Panel>
  );
}

export function BarTrend({ monthly }: { monthly: { label: string; issues: number; receives: number }[] }) {
  const max = Math.max(1, ...monthly.flatMap((point) => [point.issues, point.receives]));
  if (!monthly.length) return <p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">No monthly activity yet.</p>;
  return (
    <div className="flex h-72 items-end gap-4 overflow-x-auto px-2 pt-4">
      {monthly.map((point) => (
        <div key={point.label} className="flex min-w-20 flex-1 flex-col items-center gap-3">
          <div className="flex h-52 items-end gap-2">
            <div className="w-7 rounded-t bg-[#6d5dfc]" style={{ height: `${Math.max(8, (point.issues / max) * 100)}%` }} />
            <div className="w-7 rounded-t bg-emerald-500" style={{ height: `${Math.max(8, (point.receives / max) * 100)}%` }} />
          </div>
          <p className="text-xs font-semibold text-slate-500">{point.label.split(" ")[0]}</p>
        </div>
      ))}
    </div>
  );
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) return <p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">No transactions yet.</p>;
  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((tx) => (
        <div key={tx._id} className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-bold ${tx.type === "issue" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}>
              {tx.type === "issue" ? "D" : "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{tx.type === "issue" ? "Issued" : "Returned"} - {tx.itemName}</p>
              <p className="truncate text-sm text-slate-500">{tx.type === "issue" ? "Issued to" : "Returned by"}: {tx.party || "N/A"}</p>
              <p className="truncate text-sm text-slate-500">Quantity: {tx.quantity}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-slate-500">{formatDate(tx.createdAt)}</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${tx.type === "issue" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
              {tx.type === "issue" ? "ISSUED" : "RETURNED"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LowStockList({ items, onRestock }: { items: Item[]; onRestock?: (itemId: string) => void }) {
  if (!items.length) return <p className="rounded-lg bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">All items are above their low stock threshold.</p>;
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item._id} className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-slate-500">{item.availableQty} available, alert at {item.lowStockThreshold}</p>
          </div>
          {onRestock && <button type="button" onClick={() => onRestock(item._id)} className="rounded-md bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200">Restock</button>}
        </div>
      ))}
    </div>
  );
}

export function ToastMessage({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-indigo-200 bg-indigo-50 text-indigo-800",
  }[toast.kind];
  return (
    <div className={`fixed right-5 top-5 z-50 flex max-w-sm items-start gap-4 rounded-lg border px-4 py-3 shadow-lg ${styles}`}>
      <p className="text-sm font-semibold">{toast.text}</p>
      <button type="button" onClick={onClose} className="text-sm font-bold opacity-70 hover:opacity-100">x</button>
    </div>
  );
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
