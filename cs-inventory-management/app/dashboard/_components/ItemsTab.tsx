import type { Item } from "./types";
import { categories, Field, MetricMini, Panel } from "./ui";

export function ItemsTab({
  items,
  allItems,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  formState,
  setFormState,
  onSubmit,
  busy,
  onSelectItem,
  onDeleteItem,
}: {
  items: Item[];
  allItems: Item[];
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  formState: { name: string; category: string; quantity: number; lowStockThreshold: number; description: string };
  setFormState: React.Dispatch<React.SetStateAction<{ name: string; category: string; quantity: number; lowStockThreshold: number; description: string }>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  onSelectItem: (itemId: string, panel: "issue" | "return") => void;
  onDeleteItem: (itemId: string) => void;
}) {
  const totalAvailable = allItems.reduce((sum, item) => sum + item.availableQty, 0);
  const lowStockCount = allItems.filter((item) => item.availableQty <= item.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricMini label="Inventory Records" value={allItems.length} />
        <MetricMini label="Available Units" value={totalAvailable} tone="green" />
        <MetricMini label="Low Stock Alerts" value={lowStockCount} tone="orange" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Items">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="focus-accent h-11 rounded-md border border-slate-200 px-4 text-sm outline-none" placeholder="Search items..." />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="focus-accent h-11 rounded-md border border-slate-200 px-4 text-sm outline-none">
              <option>All</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <DataTable items={items} onSelectItem={onSelectItem} onDeleteItem={onDeleteItem} busy={busy} />
        </Panel>
        <Panel title="Add Item">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Item Name">
              <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} className="form-input" required />
            </Field>
            <Field label="Category">
              <select value={formState.category} onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))} className="form-input">
                {categories.map((category) => <option key={category}>{category}</option>)}
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
              <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} className="form-input min-h-24" />
            </Field>
            <button type="submit" disabled={busy} className="accent-bg w-full rounded-md px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Saving..." : "Save Item"}
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

function DataTable({ items, onSelectItem, onDeleteItem, busy }: { items: Item[]; onSelectItem: (itemId: string, panel: "issue" | "return") => void; onDeleteItem: (itemId: string) => void; busy: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Item Name</th>
            <th className="px-5 py-4 font-semibold">Category</th>
            <th className="px-5 py-4 font-semibold">Total Qty</th>
            <th className="px-5 py-4 font-semibold">Available Qty</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-t border-slate-200">
              <td className="px-5 py-4 font-semibold">{item.name}</td>
              <td className="px-5 py-4 text-slate-600">{item.category}</td>
              <td className="px-5 py-4">{item.totalQty}</td>
              <td className="px-5 py-4">{item.availableQty}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.availableQty <= item.lowStockThreshold ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {item.availableQty <= item.lowStockThreshold ? "Low Stock" : "Available"}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <button type="button" onClick={() => onSelectItem(item._id, "issue")} className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Issue</button>
                  <button type="button" onClick={() => onSelectItem(item._id, "return")} className="accent-soft-bg accent-text rounded-md px-3 py-2 text-xs font-semibold">Receive</button>
                  <button type="button" onClick={() => onDeleteItem(item._id)} disabled={busy} className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
