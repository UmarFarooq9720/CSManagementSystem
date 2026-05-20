"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Toast = { kind: "success" | "error" | "info"; text: string } | null;

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = (kind: "success" | "error" | "info", text: string) => {
    setToast({ kind, text });
  };

  const readJson = async <T,>(response: Response, fallback: T) => {
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T & { error?: string }) : fallback;
    if (!response.ok) throw new Error(data && "error" in data && data.error ? data.error : `Request failed: ${response.status}`);
    return data;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);

    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }).then((response) => readJson<{ error?: string }>(response, {}));

      if (result.error) throw new Error(result.error);
      showToast("success", mode === "login" ? "Signed in successfully." : "Account created successfully.");
      router.push("/dashboard");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to complete request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[440px_1fr]">
        <aside className="bg-[#071b34] px-6 py-8 text-white sm:px-10">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-300 text-lg font-black text-[#071b34]">CS</div>
            <div>
              <h1 className="text-xl font-bold">CS Inventory</h1>
              <p className="text-sm text-slate-300">Management System</p>
            </div>
          </div>

          <div className="mt-16 max-w-sm">
            <p className="text-xs font-semibold uppercase text-cyan-200">Offline ready inventory</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">Manage stock, issue items, and track returns.</h2>
            <p className="mt-5 leading-7 text-slate-300">
              A clean dashboard for department inventory, low stock alerts, transaction history, reports, and local fallback storage when MongoDB is unavailable.
            </p>
          </div>

          <div className="mt-12 grid gap-3">
            <Feature label="Items" text="Create and monitor department assets." />
            <Feature label="Issue / Return" text="Record movement with staff and purpose." />
            <Feature label="Reports" text="Review categories, trends, and restock needs." />
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase text-slate-500">{mode === "login" ? "Sign in" : "Create account"}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Start managing inventory"}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {mode === "login" ? "Access your inventory dashboard." : "Create a staff account for inventory access."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-[#5b45df] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-[#5b45df] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <Field label="Name">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="John Doe"
                    className="form-input"
                  />
                </Field>
              )}
              <Field label="Email">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="form-input"
                />
              </Field>
              <Field label="Password">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  type="password"
                  className="form-input"
                />
              </Field>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#5b45df] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-[#4936c4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Working..." : mode === "login" ? "Login to dashboard" : "Create account"}
              </button>
            </form>
          </section>
        </main>
      </div>
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function Feature({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-sm text-slate-300">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-600">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ToastMessage({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;

  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-indigo-200 bg-indigo-50 text-indigo-800",
  }[toast.kind];

  return (
    <div className={`fixed right-5 top-5 z-50 flex max-w-sm items-start gap-4 rounded-lg border px-4 py-3 shadow-lg ${styles}`}>
      <p className="text-sm font-semibold">{toast.text}</p>
      <button type="button" onClick={onClose} className="text-sm font-bold opacity-70 hover:opacity-100">
        x
      </button>
    </div>
  );
}
