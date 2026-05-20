import { NextResponse } from "next/server";
import connect from "../../../../lib/mongo";
import { parseCookies, verifyToken } from "../../../../lib/auth";

export async function GET(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies.inventory_token;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const db = await connect();
    const user = await db.collection("users").findOne({ email: payload.email });
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user: { email: user.email, name: user.name, role: user.role || "staff" } });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
