import { useEffect, useMemo, useState } from "react";
import type { PermissionSet, User } from "./types";
import { Field, Panel } from "./ui";

const permissionRows: { key: keyof PermissionSet; label: string }[] = [
  { key: "manageUsers", label: "Manage Users" },
  { key: "manageItems", label: "Manage Items" },
  { key: "issueReturn", label: "Issue / Return Items" },
  { key: "viewReports", label: "View Reports" },
  { key: "syncData", label: "Sync Data" },
  { key: "systemSettings", label: "System Settings" },
];

const defaultStaffPermissions: PermissionSet = {
  manageUsers: false,
  manageItems: true,
  issueReturn: true,
  viewReports: true,
  syncData: true,
  systemSettings: false,
};

export function UsersTab({ showToast }: { showToast: (kind: "success" | "error" | "info", text: string) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Password123!",
    role: "staff",
    permissions: defaultStaffPermissions,
  });

  useEffect(() => {
    refreshUsers();
  }, []);

  const readJson = async <T,>(response: Response, fallback: T) => {
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T & { error?: string }) : fallback;
    if (!response.ok) {
      const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : `Request failed: ${response.status}`;
      throw new Error(message);
    }
    return data;
  };

  const refreshUsers = async () => {
    try {
      const data = await fetch("/api/users").then((response) => readJson<{ users: User[] }>(response, { users: [] }));
      setUsers(data.users);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to load users.");
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => !term || [user.name, user.email, user.username, user.role].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [users, search]);

  const selectedUser = users.find((user) => user._id === selectedUserId) || users[0];

  const addUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((response) => readJson(response, {}));
      showToast("success", "User added successfully.");
      setForm({ name: "", email: "", password: "Password123!", role: "staff", permissions: defaultStaffPermissions });
      await refreshUsers();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to add user.");
    } finally {
      setBusy(false);
    }
  };

  const updateUser = async (user: User, patch: Partial<User>) => {
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...patch, id: user._id }),
      }).then((response) => readJson(response, {}));
      showToast("success", "User updated.");
      await refreshUsers();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to update user.");
    }
  };

  const deleteUser = async (id?: string) => {
    if (!id) return;
    try {
      await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: "DELETE" }).then((response) => readJson(response, {}));
      showToast("success", "User removed.");
      await refreshUsers();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to remove user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel title="Users">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="focus-accent h-11 w-full max-w-md rounded-md border border-slate-200 px-4 text-sm outline-none" placeholder="Search users..." />
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.email} className="border-t border-slate-200">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="accent-bg grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white">{initials(user.name)}</div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{user.username}</td>
                    <td className="px-5 py-4">
                      <select value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold">
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => updateUser(user, { status: user.status === "inactive" ? "active" : "inactive" })} className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === "inactive" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {user.status === "inactive" ? "Inactive" : "Active"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setSelectedUserId(user._id || "")} className="accent-soft-bg accent-text rounded-md px-3 py-2 text-xs font-semibold">Permissions</button>
                        <button type="button" onClick={() => deleteUser(user._id)} className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Add User">
          <form onSubmit={addUser} className="space-y-4">
            <Field label="Name">
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="form-input" required />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="form-input" required />
            </Field>
            <Field label="Temporary Password">
              <input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} className="form-input" required />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="form-input">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <div className="space-y-2">
              {permissionRows.map((row) => (
                <label key={row.key} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                  {row.label}
                  <input
                    type="checkbox"
                    checked={form.permissions[row.key]}
                    onChange={() => setForm((prev) => ({ ...prev, permissions: { ...prev.permissions, [row.key]: !prev.permissions[row.key] } }))}
                  />
                </label>
              ))}
            </div>
            <button disabled={busy} className="accent-bg w-full rounded-md px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" type="submit">
              {busy ? "Saving..." : "Add User"}
            </button>
          </form>
        </Panel>
      </div>

      <Panel title="User Permissions">
        {selectedUser ? (
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Editing permissions for</p>
              <p className="mt-1 text-lg font-bold">{selectedUser.name}</p>
              <p className="text-sm text-slate-500">{selectedUser.email}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {permissionRows.map((row) => {
                const permissions = selectedUser.permissions || defaultStaffPermissions;
                return (
                  <label key={row.key} className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold">
                    {row.label}
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[row.key])}
                      onChange={() =>
                        updateUser(selectedUser, {
                          permissions: {
                            ...permissions,
                            [row.key]: !permissions[row.key],
                          },
                        })
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">Add a user to manage permissions.</p>
        )}
      </Panel>

      <Panel title="Role Permissions">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-5 py-4">Permission</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4">Staff</th>
              </tr>
            </thead>
            <tbody>
              {permissionRows.map((row) => (
                <tr key={row.key} className="border-b border-slate-100">
                  <td className="px-5 py-4">{row.label}</td>
                  <td className="px-5 py-4 text-emerald-600">Yes</td>
                  <td className="px-5 py-4">{defaultStaffPermissions[row.key] ? <span className="text-emerald-600">Yes</span> : <span className="text-rose-500">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
