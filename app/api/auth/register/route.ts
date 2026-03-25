import { NextResponse } from "next/server";
import { applySessionCookie, createSession, createUser, findUserByEmail } from "@/lib/server/auth";

type RegisterInput = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterInput;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email.endsWith(".edu")) {
      return NextResponse.json({ error: "Use your school email (.edu)." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await createUser(email, password);
    const session = await createSession(user.id);

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    applySessionCookie(res, session.token, session.expiresAt);
    return res;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
