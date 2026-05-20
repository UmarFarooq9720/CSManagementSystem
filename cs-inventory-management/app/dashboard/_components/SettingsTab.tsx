import { useEffect, useState } from "react";
import { Field, Panel } from "./ui";

type SettingsTabKey = "General" | "Inventory" | "Notifications" | "Sync" | "Security" | "Backup";

const tabs: SettingsTabKey[] = ["General", "Inventory", "Notifications", "Sync", "Security", "Backup"];
const colors = ["#5b45df", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function SettingsTab({ onSave }: { onSave: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("General");
  const [theme, setTheme] = useState("Light");
  const [primary, setPrimary] = useState("#5b45df");
  const [general, setGeneral] = useState({
    systemName: "CS Department Inventory System",
    department: "Computer Science",
    academicYear: "2024-2025",
    language: "English",
    dateFormat: "DD-MM-YYYY",
    timezone: "(UTC+05:00) Islamabad, Karachi",
  });
  const [inventory, setInventory] = useState({ defaultCategory: "Computers", lowStockDefault: 5, issueLimit: 10 });
  const [notifications, setNotifications] = useState({ lowStockEmail: true, issueReceipt: true, weeklyReport: false });
  const [sync, setSync] = useState({ offline: true, autoSync: true, syncInterval: "15 minutes" });
  const [security, setSecurity] = useState({ sessionDays: 7, requireStrongPassword: true, staffCanRegister: false });
  const [backup, setBackup] = useState({ autoBackup: true, backupFrequency: "Daily", retentionDays: 30 });

  useEffect(() => {
    const saved = window.localStorage.getItem("inventory-primary-color");
    if (saved) setPrimary(saved);

    const savedSettings = window.localStorage.getItem("inventory-settings");
    if (!savedSettings) return;

    try {
      const parsed = JSON.parse(savedSettings);
      if (parsed.general) setGeneral(parsed.general);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.sync) setSync(parsed.sync);
      if (parsed.security) setSecurity(parsed.security);
      if (parsed.backup) setBackup(parsed.backup);
      if (parsed.theme) setTheme(parsed.theme);
    } catch {
      window.localStorage.removeItem("inventory-settings");
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", primary);
    document.documentElement.style.setProperty("--accent-soft", hexToRgba(primary, 0.1));
    window.localStorage.setItem("inventory-primary-color", primary);
  }, [primary]);

  const save = (message: string) => {
    window.localStorage.setItem(
      "inventory-settings",
      JSON.stringify({ general, inventory, notifications, sync, security, backup, theme })
    );
    onSave(message);
  };

  return (
    <div className="space-y-6">
      <Panel title="Settings">
        <div className="mb-5 flex flex-wrap gap-6 border-b border-slate-200 text-sm font-semibold">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`border-b-2 px-1 pb-3 ${activeTab === tab ? "accent-border accent-text" : "border-transparent text-slate-500"}`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "General" && (
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="System Name">
                <input className="form-input" value={general.systemName} onChange={(event) => setGeneral((prev) => ({ ...prev, systemName: event.target.value }))} />
              </Field>
              <Field label="Department">
                <input className="form-input" value={general.department} onChange={(event) => setGeneral((prev) => ({ ...prev, department: event.target.value }))} />
              </Field>
              <Field label="Academic Year">
                <select className="form-input" value={general.academicYear} onChange={(event) => setGeneral((prev) => ({ ...prev, academicYear: event.target.value }))}>
                  <option>2024-2025</option>
                  <option>2025-2026</option>
                  <option>2026-2027</option>
                </select>
              </Field>
              <Field label="System Language">
                <select className="form-input" value={general.language} onChange={(event) => setGeneral((prev) => ({ ...prev, language: event.target.value }))}>
                  <option>English</option>
                  <option>Urdu</option>
                </select>
              </Field>
              <Field label="Date Format">
                <select className="form-input" value={general.dateFormat} onChange={(event) => setGeneral((prev) => ({ ...prev, dateFormat: event.target.value }))}>
                  <option>DD-MM-YYYY</option>
                  <option>MM-DD-YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </Field>
              <Field label="Time Zone">
                <select className="form-input" value={general.timezone} onChange={(event) => setGeneral((prev) => ({ ...prev, timezone: event.target.value }))}>
                  <option>(UTC+05:00) Islamabad, Karachi</option>
                  <option>(UTC+00:00) UTC</option>
                  <option>(UTC-05:00) Eastern Time</option>
                </select>
              </Field>
            </div>
            <SaveButton onClick={() => save("General settings saved.")} />
          </div>
        )}

        {activeTab === "Inventory" && (
          <div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Default Category">
                <select className="form-input" value={inventory.defaultCategory} onChange={(event) => setInventory((prev) => ({ ...prev, defaultCategory: event.target.value }))}>
                  <option>Computers</option>
                  <option>Networking</option>
                  <option>Lab Equipment</option>
                  <option>Accessories</option>
                  <option>Furniture</option>
                </select>
              </Field>
              <Field label="Default Low Stock Alert">
                <input type="number" min={1} className="form-input" value={inventory.lowStockDefault} onChange={(event) => setInventory((prev) => ({ ...prev, lowStockDefault: Number(event.target.value) }))} />
              </Field>
              <Field label="Issue Quantity Limit">
                <input type="number" min={1} className="form-input" value={inventory.issueLimit} onChange={(event) => setInventory((prev) => ({ ...prev, issueLimit: Number(event.target.value) }))} />
              </Field>
            </div>
            <SaveButton onClick={() => save("Inventory settings saved.")} />
          </div>
        )}

        {activeTab === "Notifications" && (
          <div>
            <Preference label="Low Stock Emails" helper="Notify admins when stock reaches threshold" checked={notifications.lowStockEmail} onChange={() => setNotifications((prev) => ({ ...prev, lowStockEmail: !prev.lowStockEmail }))} />
            <Preference label="Issue Receipts" helper="Create a confirmation notice after issue or return" checked={notifications.issueReceipt} onChange={() => setNotifications((prev) => ({ ...prev, issueReceipt: !prev.issueReceipt }))} />
            <Preference label="Weekly Reports" helper="Send weekly inventory summary" checked={notifications.weeklyReport} onChange={() => setNotifications((prev) => ({ ...prev, weeklyReport: !prev.weeklyReport }))} />
            <SaveButton onClick={() => save("Notification settings saved.")} />
          </div>
        )}

        {activeTab === "Sync" && (
          <div>
            <Preference label="Offline Mode" helper="Allow users to work offline" checked={sync.offline} onChange={() => setSync((prev) => ({ ...prev, offline: !prev.offline }))} />
            <Preference label="Auto Sync" helper="Automatically sync data when online" checked={sync.autoSync} onChange={() => setSync((prev) => ({ ...prev, autoSync: !prev.autoSync }))} />
            <Field label="Sync Interval">
              <select className="form-input" value={sync.syncInterval} onChange={(event) => setSync((prev) => ({ ...prev, syncInterval: event.target.value }))}>
                <option>5 minutes</option>
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>Hourly</option>
              </select>
            </Field>
            <SaveButton onClick={() => save("Sync settings saved.")} />
          </div>
        )}

        {activeTab === "Security" && (
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Session Length">
                <input type="number" min={1} className="form-input" value={security.sessionDays} onChange={(event) => setSecurity((prev) => ({ ...prev, sessionDays: Number(event.target.value) }))} />
              </Field>
              <div className="space-y-1 pt-1">
                <Preference label="Strong Passwords" helper="Require secure passwords for new users" checked={security.requireStrongPassword} onChange={() => setSecurity((prev) => ({ ...prev, requireStrongPassword: !prev.requireStrongPassword }))} />
                <Preference label="Staff Self Registration" helper="Allow staff to create accounts from login page" checked={security.staffCanRegister} onChange={() => setSecurity((prev) => ({ ...prev, staffCanRegister: !prev.staffCanRegister }))} />
              </div>
            </div>
            <SaveButton onClick={() => save("Security settings saved.")} />
          </div>
        )}

        {activeTab === "Backup" && (
          <div>
            <Preference label="Automatic Backups" helper="Create scheduled local backups" checked={backup.autoBackup} onChange={() => setBackup((prev) => ({ ...prev, autoBackup: !prev.autoBackup }))} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Backup Frequency">
                <select className="form-input" value={backup.backupFrequency} onChange={(event) => setBackup((prev) => ({ ...prev, backupFrequency: event.target.value }))}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </Field>
              <Field label="Retention Days">
                <input type="number" min={1} className="form-input" value={backup.retentionDays} onChange={(event) => setBackup((prev) => ({ ...prev, retentionDays: Number(event.target.value) }))} />
              </Field>
            </div>
            <SaveButton onClick={() => save("Backup settings saved.")} />
          </div>
        )}
      </Panel>

      <Panel title="Appearance">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">Theme</p>
            <div className="mt-3 flex gap-5 text-sm">
              {["Light", "Dark"].map((value) => (
                <label key={value} className="flex items-center gap-2">
                  <input type="radio" checked={theme === value} onChange={() => setTheme(value)} />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Primary Color</p>
            <div className="mt-3 flex gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setPrimary(color);
                    onSave("Primary color updated.");
                  }}
                  className="h-7 w-7 rounded-full ring-2 ring-offset-2"
                  style={{ backgroundColor: color, boxShadow: primary === color ? `0 0 0 2px ${color}` : "none" }}
                />
              ))}
            </div>
          </div>
        </div>
        <SaveButton onClick={() => save("Appearance settings saved.")} />
      </Panel>
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-5 text-right">
      <button className="accent-bg rounded-md px-5 py-3 text-sm font-semibold text-white" type="button" onClick={onClick}>Save Changes</button>
    </div>
  );
}

function Preference({ label, helper, checked, onChange }: { label: string; helper: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-slate-500">{helper}</p>
      </div>
      <button type="button" onClick={onChange} className={`h-7 w-12 rounded-full p-1 transition ${checked ? "accent-bg" : "bg-slate-300"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const red = parseInt(clean.slice(0, 2), 16);
  const green = parseInt(clean.slice(2, 4), 16);
  const blue = parseInt(clean.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
