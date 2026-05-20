import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import connect from "../../../../lib/mongo";

function idQuery(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

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
  const query = idQuery(id);
  const item = await db.collection("items").findOne(query as any);
  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  await db.collection("items").updateOne(query as any, { $set: updates });
  const updated = await db.collection("items").findOne(query as any);
  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = (await Promise.resolve(params)) as { id: string };
  const id = resolvedParams.id;

  const db = await connect();
  const result = await db.collection("items").deleteOne(idQuery(id) as any);

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
