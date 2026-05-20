import type { PanelId, User } from "./types";

const navGroups: { title: string; items: { id: PanelId; label: string; icon: string }[] }[] = [
  { title: "Main", items: [{ id: "dashboard", label: "Dashboard", icon: "H" }] },
  {
    title: "Operations",
    items: [
      { id: "items", label: "Items", icon: "I" },
      { id: "addItem", label: "Add Item", icon: "+" },
      { id: "issue", label: "Issue Item", icon: "O" },
      { id: "return", label: "Return Item", icon: "R" },
      { id: "transactions", label: "My Transactions", icon: "T" },
    ],
  },
  { title: "Reports", items: [{ id: "reports", label: "Reports", icon: "B" }] },
  {
    title: "System",
    items: [
      { id: "users", label: "Users", icon: "U" },
      { id: "settings", label: "Settings", icon: "S" },
    ],
  },
];

export function Sidebar({
  activePanel,
  setActivePanel,
  user,
  onLogout,
  collapsed,
  onToggle,
}: {
  activePanel: PanelId;
  setActivePanel: (panel: PanelId) => void;
  user: User | null;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className="overflow-hidden bg-[#071b34] px-5 py-6 text-white transition-all">
      <div className={`mb-10 flex items-center ${collapsed ? "justify-center gap-2" : "justify-between gap-3"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "hidden" : ""}`}>
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-lg font-black text-[#071b34]">CS</div>
          <div>
            <h1 className="text-xl font-bold">CS Inventory</h1>
            <p className="text-sm text-slate-300">Management System</p>
          </div>
        </div>
        {collapsed && <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-lg font-black text-[#071b34]">CS</div>}
        <button className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-sm font-bold hover:bg-white/15" type="button" onClick={onToggle} title={collapsed ? "Open sidebar" : "Close sidebar"}>
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="space-y-7">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && <p className="mb-3 text-xs font-semibold uppercase text-slate-400">{group.title}</p>}
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePanel(item.id)}
                  title={item.label}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${collapsed ? "justify-center" : ""} ${
                    activePanel === item.id ? "accent-bg text-white shadow-lg shadow-indigo-950/30" : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded border border-white/20 text-xs">{item.icon}</span>
                  {!collapsed && item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-8 rounded-md bg-white/5 p-4">
          <p className="text-sm text-slate-300">Signed in as</p>
          <p className="mt-1 font-semibold">{user?.name || "User"}</p>
          <button type="button" onClick={onLogout} className="mt-4 w-full rounded-md bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
