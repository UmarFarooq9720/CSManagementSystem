import type { Item, ReportData } from "./types";
import { BarTrend, CategoryLegend, Donut, LowStockList, MetricMini, Panel } from "./ui";

export function ReportsTab({
  reportData,
  summary,
  categories,
  lowStockItems,
}: {
  reportData: ReportData | null;
  summary: { totalItems: number; availableQty: number; issuedQty: number; receivedQty: number };
  categories: Record<string, number>;
  lowStockItems: Item[];
}) {
  return (
    <div className="space-y-6">
      <Panel title="Reports">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricMini label="Total Items" value={reportData?.summary.totalItems ?? summary.totalItems} />
          <MetricMini label="Issued Items" value={reportData?.summary.issuedItems ?? summary.issuedQty} tone="orange" />
          <MetricMini label="Returned Items" value={summary.receivedQty} tone="green" />
          <MetricMini label="Currently Available" value={reportData?.summary.availableItems ?? summary.availableQty} tone="green" />
        </div>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Category Overview">
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <Donut categories={reportData?.categoryOverview ?? categories} />
            <CategoryLegend categories={reportData?.categoryOverview ?? categories} />
          </div>
        </Panel>
        <Panel title="Report Overview">
          <BarTrend monthly={reportData?.monthly ?? []} />
        </Panel>
      </div>
      <Panel title="Restock Required">
        <LowStockList items={lowStockItems} />
      </Panel>
    </div>
  );
}
