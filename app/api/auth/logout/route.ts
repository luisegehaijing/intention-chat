import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionTokenFromCookies, revokeSessionByToken } from "@/lib/server/auth";

export async function POST() {
  const token = await getSessionTokenFromCookies();
  if (token) {
    await revokeSessionByToken(token);
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
