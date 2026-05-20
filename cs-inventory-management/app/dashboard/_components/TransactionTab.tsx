import type { Item } from "./types";
import { Field, MetricMini, Panel } from "./ui";

export function TransactionTab({
  mode,
  txState,
  setTxState,
  items,
  onSubmit,
  busy,
}: {
  mode: "issue" | "receive";
  txState: { type: "issue" | "receive"; itemId: string; quantity: number; party: string; purpose: string };
  setTxState: React.Dispatch<React.SetStateAction<{ type: "issue" | "receive"; itemId: string; quantity: number; party: string; purpose: string }>>;
  items: Item[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  const selectedItem = items.find((item) => item._id === txState.itemId);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_0.55fr]">
      <Panel title={mode === "issue" ? "Issue Item" : "Return Item"}>
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Select Item">
            <select value={txState.itemId} onChange={(event) => setTxState((prev) => ({ ...prev, itemId: event.target.value }))} className="form-input" required>
              <option value="">Select item</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>{item.name} - {item.availableQty} available</option>
              ))}
            </select>
          </Field>
          <Field label="Quantity">
            <input type="number" min={1} max={mode === "issue" && selectedItem ? selectedItem.availableQty : undefined} value={txState.quantity} onChange={(event) => setTxState((prev) => ({ ...prev, quantity: Number(event.target.value) }))} className="form-input" required />
          </Field>
          <Field label={mode === "issue" ? "Issue To" : "Returned By"}>
            <input value={txState.party} onChange={(event) => setTxState((prev) => ({ ...prev, party: event.target.value }))} className="form-input" placeholder={mode === "issue" ? "Staff name or lab" : "Staff name, supplier, or store"} required />
          </Field>
          <Field label="Purpose">
            <input value={txState.purpose} onChange={(event) => setTxState((prev) => ({ ...prev, purpose: event.target.value }))} className="form-input" placeholder="Lab work, repair, replacement, purchase" required />
          </Field>
          <button type="submit" disabled={busy || !txState.itemId} className="accent-bg w-full rounded-md px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Saving..." : mode === "issue" ? "Issue Item" : "Return Item"}
          </button>
        </form>
      </Panel>
      <Panel title="Stock Details">
        {selectedItem ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Selected item</p>
              <p className="mt-1 text-xl font-bold">{selectedItem.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricMini label="Available" value={selectedItem.availableQty} tone="green" />
              <MetricMini label="Total" value={selectedItem.totalQty} />
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Stock rule</p>
              <p className="mt-2">Issue cannot exceed available quantity. Return adds to both available and total quantity.</p>
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">Select an item to see stock details.</p>
        )}
      </Panel>
    </div>
  );
}
