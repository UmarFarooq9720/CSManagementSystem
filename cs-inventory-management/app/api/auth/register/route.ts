import { NextResponse, NextRequest } from "next/server";
import connect from "../../../../lib/mongo";
import { createToken, hashPassword, serializeCookie } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  const db = await connect();
  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const result = await db.collection("users").insertOne({
    name,
    email,
    username: email.split("@")[0],
    passwordHash,
    role: "admin",
    status: "active",
    permissions: {
      manageUsers: true,
      manageItems: true,
      issueReturn: true,
      viewReports: true,
      syncData: true,
      systemSettings: true,
    },
    createdAt: new Date(),
  });

  const token = createToken({ email, name, id: result.insertedId.toString() });
  const response = NextResponse.json({ user: { email, name, role: "admin" } });
  response.headers.set("Set-Cookie", serializeCookie("inventory_token", token));
  return response;
}
