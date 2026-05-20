import { NextResponse } from "next/server";
import connect from "../../../lib/mongo";

export async function GET() {
  const db = await connect();
  const items = await db.collection("items").find().toArray();
  const transactions = await db.collection("transactions").find().toArray();

  const totalItems = items.length;
  const availableItems = items.reduce((sum, item) => sum + (item.availableQty || 0), 0);
  const issuedItems = transactions.filter((tx) => tx.type === "issue").reduce((sum, tx) => sum + tx.quantity, 0);
  const receivedItems = transactions.filter((tx) => tx.type === "receive").reduce((sum, tx) => sum + tx.quantity, 0);
  const lowStockCount = items.filter((item) => item.availableQty <= item.lowStockThreshold).length;
  const categoryOverview = items.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.availableQty || 0);
    return acc;
  }, {});

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const label = `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
    const month = date.getMonth();
    const year = date.getFullYear();
    const issues = transactions.filter((tx) => tx.type === "issue" && new Date(tx.createdAt).getMonth() === month && new Date(tx.createdAt).getFullYear() === year).reduce((sum, tx) => sum + tx.quantity, 0);
    const receives = transactions.filter((tx) => tx.type === "receive" && new Date(tx.createdAt).getMonth() === month && new Date(tx.createdAt).getFullYear() === year).reduce((sum, tx) => sum + tx.quantity, 0);
    return { label, issues, receives };
  });

  return NextResponse.json({
    summary: { totalItems, availableItems, issuedItems, lowStockCount },
    categoryOverview,
    monthly,
    transactions,
  });
}
