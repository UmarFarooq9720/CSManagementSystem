import type { Transaction } from "./types";
import { Panel, TransactionList } from "./ui";

export function TransactionsTab({
  transactions,
  filter,
  setFilter,
}: {
  transactions: Transaction[];
  filter: "all" | "issue" | "receive";
  setFilter: (value: "all" | "issue" | "receive") => void;
}) {
  return (
    <Panel title="My Transactions">
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "issue", "receive"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${filter === value ? "accent-bg text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {value === "receive" ? "returned" : value}
          </button>
        ))}
      </div>
      <TransactionList transactions={transactions} />
    </Panel>
  );
}
