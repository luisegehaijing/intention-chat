import { NextResponse } from "next/server";
import { applySessionCookie, createSession, findUserByEmail, verifyPassword } from "@/lib/server/auth";

type LoginInput = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginInput;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = await createSession(user.id);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    applySessionCookie(res, session.token, session.expiresAt);
    return res;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
