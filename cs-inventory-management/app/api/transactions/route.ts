import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import connect from "../../../lib/mongo";

function itemIdQuery(itemId: string) {
  return ObjectId.isValid(itemId) ? { _id: new ObjectId(itemId) } : { _id: itemId };
}

function sameId(left: unknown, right: unknown) {
  return String(left) === String(right);
}

export async function GET() {
  const db = await connect();
  const transactions = await db.collection("transactions").find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ transactions });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const itemId = String(body.itemId || "").trim();
  const type = String(body.type || "issue");
  const quantity = Number(body.quantity || 0);
  const party = String(body.party || "").trim();
  const purpose = String(body.purpose || "").trim();

  if (!itemId) {
    return NextResponse.json({ error: "Please select an item before saving the transaction." }, { status: 400 });
  }

  if (!["issue", "receive"].includes(type)) {
    return NextResponse.json({ error: "Transaction type must be issue or receive." }, { status: 400 });
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Quantity must be at least 1." }, { status: 400 });
  }

  const db = await connect();
  const query = itemIdQuery(itemId);
  const item = await db.collection("items").findOne(query as any);
  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  const update: Record<string, number> = {};
  if (type === "issue") {
    if (item.availableQty < quantity) {
      return NextResponse.json({ error: "Not enough available stock to issue." }, { status: 400 });
    }
    update.availableQty = item.availableQty - quantity;
  } else {
    const transactions = await db.collection("transactions").find().toArray();
    const itemTransactions = transactions.filter((tx) => sameId(tx.itemId, item._id));
    const issuedQty = itemTransactions
      .filter((tx) => tx.type === "issue")
      .reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);
    const returnedQty = itemTransactions
      .filter((tx) => tx.type === "receive")
      .reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);
    const outstandingQty = issuedQty - returnedQty;

    if (outstandingQty <= 0) {
      return NextResponse.json({ error: "There is no issued quantity for this item to return." }, { status: 400 });
    }

    if (quantity > outstandingQty) {
      return NextResponse.json({ error: `Only ${outstandingQty} issued unit${outstandingQty === 1 ? "" : "s"} can be returned.` }, { status: 400 });
    }

    update.availableQty = item.availableQty + quantity;
    update.totalQty = item.totalQty + quantity;
  }

  await db.collection("items").updateOne(query as any, { $set: update });
  const transaction = {
    itemId: item._id,
    itemName: item.name,
    type,
    quantity,
    party,
    purpose,
    createdAt: new Date(),
  };
  await db.collection("transactions").insertOne(transaction);

  return NextResponse.json({ transaction, item: { ...item, ...update } });
}
