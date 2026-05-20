import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import connect from "../../../lib/mongo";
import { hashPassword, parseCookies, verifyToken } from "../../../lib/auth";

const defaultPermissions = {
  manageUsers: false,
  manageItems: true,
  issueReturn: true,
  viewReports: true,
  syncData: true,
  systemSettings: false,
};

function idQuery(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

async function requireAdmin(request: NextRequest) {
  try {
    const cookies = parseCookies(request.headers.get("cookie"));
    const token = cookies.inventory_token;
    if (!token) return null;

    const payload = verifyToken(token);
    const db = await connect();
    const user = await db.collection("users").findOne({ email: payload.email });
    if (!user || user.role !== "admin") return null;
    return { db, user };
  } catch {
    return null;
  }
}

function sanitizeUser(user: Record<string, unknown>) {
  const role = String(user.role || "staff");
  return {
    _id: String(user._id),
    name: String(user.name || ""),
    email: String(user.email || ""),
    username: String(user.username || user.email || "").split("@")[0],
    role,
    status: String(user.status || "active"),
    permissions: {
      ...defaultPermissions,
      ...(role === "admin" ? { manageUsers: true, systemSettings: true } : {}),
      ...((user.permissions || {}) as Record<string, boolean>),
    },
    createdAt: user.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const users = await session.db.collection("users").find().sort({ name: 1 }).toArray();
  return NextResponse.json({ users: users.map((user) => sanitizeUser(user as Record<string, unknown>)) });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "Password123!");
  const role = String(body.role || "staff");
  const permissions = { ...defaultPermissions, ...(body.permissions || {}) };

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const existing = await session.db.collection("users").findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const user = {
    name,
    email,
    username: email.split("@")[0],
    passwordHash: hashPassword(password),
    role,
    status: "active",
    permissions: role === "admin" ? { ...permissions, manageUsers: true, systemSettings: true } : permissions,
    createdAt: new Date(),
  };
  const result = await session.db.collection("users").insertOne(user);
  return NextResponse.json({ user: sanitizeUser({ ...user, _id: result.insertedId }) });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const body = await request.json();
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });

  const role = String(body.role || "staff");
  const update = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    role,
    status: String(body.status || "active"),
    permissions: {
      ...defaultPermissions,
      ...(role === "admin" ? { manageUsers: true, systemSettings: true } : {}),
      ...(body.permissions || {}),
    },
  };

  await session.db.collection("users").updateOne(idQuery(id) as any, { $set: update });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });

  await session.db.collection("users").deleteOne(idQuery(id) as any);
  return NextResponse.json({ ok: true });
}
