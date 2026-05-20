import type { PanelId, User } from "./types";

export function TopBar({ panel, user, onToggleSidebar }: { panel: PanelId; user: User | null; onToggleSidebar: () => void }) {
  const title = panelTitle(panel);
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm" type="button" onClick={onToggleSidebar} title="Toggle sidebar">
          M
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-slate-500">{title === "Dashboard" ? `Welcome back, ${user?.name || "User"}!` : subtitleFor(title)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="accent-bg grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-white">{initials(user?.name)}</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500">{user?.role || "Staff"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function panelTitle(panel: PanelId) {
  return {
    dashboard: "Dashboard",
    items: "Items",
    issue: "Issue Item",
    return: "Return Item",
    transactions: "My Transactions",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
  }[panel];
}

function subtitleFor(title: string) {
  return {
    Items: "Manage department inventory items",
    "Issue Item": "Assign inventory to staff or labs",
    "Return Item": "Receive returned stock into inventory",
    "My Transactions": "Review recent issue and return activity",
    Reports: "Generate inventory summaries and trends",
    Users: "Manage system users and their roles",
    Settings: "Manage system settings and preferences",
  }[title] || "Manage inventory";
}

function initials(name?: string) {
  return (name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
