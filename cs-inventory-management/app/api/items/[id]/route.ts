import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import connect from "../../../../lib/mongo";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = (await Promise.resolve(params)) as { id: string };
  const id = resolvedParams.id;
  const body = await request.json();
  const updates: Record<string, any> = {};

  if (typeof body.lowStockThreshold === "number") {
    updates.lowStockThreshold = body.lowStockThreshold;
  }
  if (typeof body.description === "string") {
    updates.description = body.description;
  }
  if (typeof body.name === "string") {
    updates.name = body.name.trim();
  }
  if (typeof body.category === "string") {
    updates.category = body.category.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid update fields provided." }, { status: 400 });
  }

  const db = await connect();
  const item = await db.collection("items").findOne({ _id: new ObjectId(id) });
  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  await db.collection("items").updateOne({ _id: new ObjectId(id) }, { $set: updates });
  const updated = await db.collection("items").findOne({ _id: new ObjectId(id) });
  return NextResponse.json({ item: updated });
}
