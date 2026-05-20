import type { Item, Transaction } from "./types";
import { BarTrend, CategoryLegend, Donut, LowStockList, MetricCard, Panel, TransactionList } from "./ui";

export function DashboardTab({
  summary,
  categories,
  lowStockItems,
  transactions,
  monthly,
  onSelectItem,
}: {
  summary: { totalItems: number; availableQty: number; issuedQty: number; lowStock: number };
  categories: Record<string, number>;
  lowStockItems: Item[];
  transactions: Transaction[];
  monthly: { label: string; issues: number; receives: number }[];
  onSelectItem: (itemId: string, panel: "issue" | "return") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Items" value={summary.totalItems} helper="All department items" color="indigo" />
        <MetricCard label="Available Items" value={summary.availableQty} helper="Currently available" color="green" />
        <MetricCard label="Issued Items" value={summary.issuedQty} helper="Currently issued" color="orange" />
        <MetricCard label="Low Stock Items" value={summary.lowStock} helper="Need attention" color="red" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Category Overview">
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <Donut categories={categories} />
            <CategoryLegend categories={categories} />
          </div>
        </Panel>
        <Panel title="Recent Transactions" action="View All">
          <TransactionList transactions={transactions.slice(0, 5)} />
        </Panel>
      </div>
      <Panel title="6 Month Stock Trend">
        <BarTrend monthly={monthly} />
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Low Stock Watch">
          <LowStockList items={lowStockItems} onRestock={(itemId) => onSelectItem(itemId, "return")} />
        </Panel>
        <Panel title="Quick Actions">
          <div className="grid gap-4 sm:grid-cols-3">
            <QuickAction label="Review alerts" helper="Check restock priorities" onClick={() => onSelectItem(lowStockItems[0]?._id || "", "return")} />
            <QuickAction label="Issue stock" helper="Assign items to staff" onClick={() => onSelectItem("", "issue")} />
            <QuickAction label="Receive stock" helper="Return or restock items" onClick={() => onSelectItem("", "return")} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function QuickAction({ label, helper, onClick }: { label: string; helper: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="hover-accent-surface rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition">
      <p className="font-bold">{label}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </button>
  );
}
