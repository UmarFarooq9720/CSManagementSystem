export type User = {
  _id?: string;
  email: string;
  username?: string;
  name: string;
  role: string;
  status?: string;
  permissions?: PermissionSet;
};

export type PermissionSet = {
  manageUsers: boolean;
  manageItems: boolean;
  issueReturn: boolean;
  viewReports: boolean;
  syncData: boolean;
  systemSettings: boolean;
};

export type Item = {
  _id: string;
  name: string;
  category: string;
  description: string;
  totalQty: number;
  availableQty: number;
  lowStockThreshold: number;
};

export type Transaction = {
  _id: string;
  itemId: string;
  itemName: string;
  type: "issue" | "receive";
  quantity: number;
  party: string;
  purpose: string;
  createdAt: string;
};

export type ReportData = {
  summary: { totalItems: number; availableItems: number; issuedItems: number; lowStockCount: number };
  categoryOverview: Record<string, number>;
  monthly: { label: string; issues: number; receives: number }[];
};

export type Toast = { kind: "success" | "error" | "info"; text: string } | null;
export type PanelId = "dashboard" | "items" | "addItem" | "issue" | "return" | "transactions" | "reports" | "users" | "settings";
