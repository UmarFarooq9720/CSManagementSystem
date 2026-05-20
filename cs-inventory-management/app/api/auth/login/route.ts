import { NextResponse } from "next/server";
import connect from "../../../../lib/mongo";
import { createToken, serializeCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const db = await connect();
  const user = await db.collection("users").findOne({ email });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = createToken({ email: user.email, name: user.name, id: user._id.toString() });
  const response = NextResponse.json({ user: { email: user.email, name: user.name, role: user.role || "staff" } });
  response.headers.set("Set-Cookie", serializeCookie("inventory_token", token));
  return response;
}
