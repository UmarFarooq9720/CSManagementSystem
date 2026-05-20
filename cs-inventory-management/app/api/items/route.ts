import { NextResponse } from "next/server";
import connect from "../../../lib/mongo";

export async function GET() {
  const db = await connect();
  const items = await db.collection("items").find().sort({ name: 1 }).toArray();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const category = String(body.category || "General").trim();
  const totalQty = Number(body.totalQty || 0);
  const lowStockThreshold = Number(body.lowStockThreshold || 5);
  const description = String(body.description || "").trim();

  if (!name || totalQty < 0) {
    return NextResponse.json({ error: "Item name and quantity are required." }, { status: 400 });
  }

  const db = await connect();
  const item = {
    name,
    category,
    description,
    totalQty,
    availableQty: totalQty,
    lowStockThreshold,
    createdAt: new Date(),
  };
  const result = await db.collection("items").insertOne(item);
  return NextResponse.json({ item: { ...item, _id: result.insertedId } });
}
