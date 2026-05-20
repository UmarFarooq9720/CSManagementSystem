"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardTab } from "./_components/DashboardTab";
import { ItemsTab } from "./_components/ItemsTab";
import { ReportsTab } from "./_components/ReportsTab";
import { SettingsTab } from "./_components/SettingsTab";
import { Sidebar } from "./_components/Sidebar";
import { TopBar } from "./_components/TopBar";
import { AddItemTab, ToastMessage } from "./_components/ui";
import { TransactionTab } from "./_components/TransactionTab";
import { TransactionsTab } from "./_components/TransactionsTab";
import { UsersTab } from "./_components/UsersTab";
import type { Item, PanelId, ReportData, Toast, Transaction, User } from "./_components/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activePanel, setActivePanel] = useState<PanelId>("dashboard");
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [txFilter, setTxFilter] = useState<"all" | "issue" | "receive">("all");
  const [busy, setBusy] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    category: "Computers",
    quantity: 1,
    lowStockThreshold: 5,
    description: "",
  });
  const [txState, setTxState] = useState({
    type: "issue" as "issue" | "receive",
    itemId: "",
    quantity: 1,
    party: "",
    purpose: "",
  });

  useEffect(() => {
    fetch("/api/user/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const result = await res.json();
        if (!result.user) throw new Error("Unauthorized");
        setUser(result.user);
      })
      .catch(() => router.push("/"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    refreshData();
  }, [user]);

  useEffect(() => {
    if (activePanel === "issue") setTxState((prev) => ({ ...prev, type: "issue" }));
    if (activePanel === "return") setTxState((prev) => ({ ...prev, type: "receive" }));
  }, [activePanel]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!items.length) {
      setTxState((prev) => ({ ...prev, itemId: "" }));
      return;
    }

    setTxState((prev) => {
      const selectedStillExists = items.some((item) => item._id === prev.itemId);
      return selectedStillExists ? prev : { ...prev, itemId: items[0]._id };
    });
  }, [items]);

  const showToast = (kind: "success" | "error" | "info", text: string) => {
    setToast({ kind, text });
  };

  const readJson = async <T,>(response: Response, fallback: T) => {
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T & { error?: string }) : fallback;
    if (!response.ok) {
      const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : `Request failed: ${response.status}`;
      throw new Error(message);
    }
    return data;
  };

  const refreshData = async () => {
    try {
      const [itemsRes, txRes, reportsRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/transactions"),
        fetch("/api/reports"),
      ]);
      const itemsJson = await readJson<{ items: Item[] }>(itemsRes, { items: [] });
      const txJson = await readJson<{ transactions: Transaction[] }>(txRes, { transactions: [] });
      const reportsJson = await readJson<ReportData | null>(reportsRes, null);
      setItems(itemsJson.items || []);
      setTransactions(txJson.transactions || []);
      setReportData(reportsJson);
      setTxState((prev) => ({ ...prev, itemId: prev.itemId || itemsJson.items?.[0]?._id || "" }));
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to refresh inventory data.");
    }
  };

  const summary = useMemo(() => {
    const totalItems = items.length;
    const availableQty = items.reduce((sum, item) => sum + Number(item.availableQty || 0), 0);
    const issuedQty = transactions.filter((tx) => tx.type === "issue").reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);
    const receivedQty = transactions.filter((tx) => tx.type === "receive").reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);
    const lowStock = items.filter((item) => item.availableQty <= item.lowStockThreshold).length;
    return { totalItems, availableQty, issuedQty, receivedQty, lowStock };
  }, [items, transactions]);

  const lowStockItems = useMemo(() => items.filter((item) => item.availableQty <= item.lowStockThreshold), [items]);

  const categoryTotals = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.availableQty || 0);
      return acc;
    }, {});
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = itemSearch.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !term || [item.name, item.category, item.description].some((value) => String(value || "").toLowerCase().includes(term));
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, itemSearch, categoryFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => txFilter === "all" || tx.type === txFilter);
  }, [transactions, txFilter]);

  const selectItemForTransaction = (itemId: string, panel: "issue" | "return") => {
    setTxState((prev) => ({ ...prev, itemId: itemId || items[0]?._id || "", type: panel === "issue" ? "issue" : "receive" }));
    setActivePanel(panel);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleCreateItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          category: formState.category,
          totalQty: Number(formState.quantity),
          lowStockThreshold: Number(formState.lowStockThreshold),
          description: formState.description,
        }),
      });
      const result = await readJson<{ error?: string }>(response, {});
      if (result.error) throw new Error(result.error);
      showToast("success", "Item added successfully.");
      setFormState({ name: "", category: "Computers", quantity: 1, lowStockThreshold: 5, description: "" });
      await refreshData();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to add item.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = items.find((entry) => entry._id === itemId);
    const itemName = item?.name || "this item";

    if (!window.confirm(`Delete ${itemName}? This action cannot be undone.`)) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/items/${encodeURIComponent(itemId)}`, { method: "DELETE" });
      await readJson<{ success?: boolean }>(response, {});
      showToast("success", "Item deleted successfully.");
      await refreshData();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to delete item.");
    } finally {
      setBusy(false);
    }
  };

  const handleTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!txState.itemId) {
      showToast("error", "Please select an item first.");
      return;
    }

    if (!Number.isFinite(Number(txState.quantity)) || Number(txState.quantity) < 1) {
      showToast("error", "Quantity must be at least 1.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txState.type,
          itemId: txState.itemId,
          quantity: Number(txState.quantity),
          party: txState.party,
          purpose: txState.purpose,
        }),
      });
      const result = await readJson<{ error?: string }>(response, {});
      if (result.error) throw new Error(result.error);
      showToast("success", txState.type === "issue" ? "Item issued successfully." : "Item returned successfully.");
      setTxState((prev) => ({ ...prev, party: "", purpose: "" }));
      await refreshData();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Transaction failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="grid min-h-screen" style={{ gridTemplateColumns: sidebarCollapsed ? "88px minmax(0, 1fr)" : "280px minmax(0, 1fr)" }}>
        <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
        <main className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <TopBar panel={activePanel} user={user} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
          {activePanel === "dashboard" && <DashboardTab summary={summary} categories={categoryTotals} lowStockItems={lowStockItems} transactions={transactions} monthly={reportData?.monthly ?? []} onSelectItem={selectItemForTransaction} />}
          {activePanel === "items" && <ItemsTab items={filteredItems} allItems={items} search={itemSearch} setSearch={setItemSearch} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} formState={formState} setFormState={setFormState} onSubmit={handleCreateItem} busy={busy} onSelectItem={selectItemForTransaction} onDeleteItem={handleDeleteItem} />}
          {activePanel === "addItem" && <AddItemTab formState={formState} setFormState={setFormState} onSubmit={handleCreateItem} busy={busy} />}
          {(activePanel === "issue" || activePanel === "return") && <TransactionTab mode={txState.type} txState={txState} setTxState={setTxState} items={items} onSubmit={handleTransaction} busy={busy} />}
          {activePanel === "transactions" && <TransactionsTab transactions={filteredTransactions} filter={txFilter} setFilter={setTxFilter} />}
          {activePanel === "reports" && <ReportsTab reportData={reportData} summary={summary} categories={categoryTotals} lowStockItems={lowStockItems} />}
          {activePanel === "users" && <UsersTab showToast={showToast} />}
          {activePanel === "settings" && <SettingsTab onSave={(message) => showToast("success", message)} />}
        </main>
      </div>
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
