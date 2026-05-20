import { categories, Field, Panel } from "./ui";
import type { Dispatch, SetStateAction } from "react";

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
      <p className="mb-6 text-sm text-slate-500">Use this tab to add new inventory items with quantity and low stock alerts.</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Item Name">
          <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} className="form-input" placeholder="Enter item name" required />
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
          <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} className="form-input min-h-24" placeholder="Optional item details" />
        </Field>
        <button type="submit" disabled={busy} className="accent-bg w-full rounded-md px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Saving..." : "Save Item"}
        </button>
      </form>
    </Panel>
  );
}
