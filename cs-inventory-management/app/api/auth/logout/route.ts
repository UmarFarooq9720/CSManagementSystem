import { NextResponse } from "next/server";
import { createExpiredCookie } from "../../../../lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", createExpiredCookie("inventory_token"));
  return response;
}
