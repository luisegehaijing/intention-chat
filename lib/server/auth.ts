import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

const SESSION_COOKIE = "synchria_session";
const SESSION_DAYS = 30;

type SessionRow = {
  id: string;
  user_id: string;
  session_token_hash: string;
  expires_at: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
};

function nowPlusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = scryptSync(password, salt, expected.length);

  return timingSafeEqual(expected, derived);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const supabase = getSupabaseAdmin();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = nowPlusDays(SESSION_DAYS).toISOString();

  const { error } = await supabase.from("pilot_sessions").insert({
    user_id: userId,
    session_token_hash: tokenHash,
    expires_at: expiresAt
  });

  if (error) throw error;
  return { token, expiresAt };
}

export function applySessionCookie(res: NextResponse, token: string, expiresAtISO: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAtISO),
    path: "/"
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/"
  });
}

export async function getSessionTokenFromCookies() {
  const store = cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getAuthenticatedUser() {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const tokenHash = hashToken(token);

  const { data: session, error: sessionError } = await supabase
    .from("pilot_sessions")
    .select("id,user_id,session_token_hash,expires_at")
    .eq("session_token_hash", tokenHash)
    .maybeSingle<SessionRow>();

  if (sessionError || !session) return null;

  if (new Date(session.expires_at) <= new Date()) {
    await supabase.from("pilot_sessions").delete().eq("id", session.id);
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("pilot_users")
    .select("id,email,password_hash")
    .eq("id", session.user_id)
    .maybeSingle<UserRow>();

  if (userError || !user) return null;

  return { id: user.id, email: user.email };
}

export async function findUserByEmail(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pilot_users")
    .select("id,email,password_hash")
    .eq("email", email)
    .maybeSingle<UserRow>();

  if (error) throw error;
  return data;
}

export async function createUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  const passwordHash = hashPassword(password);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("pilot_users")
    .insert({ email, password_hash: passwordHash })
    .select("id,email,password_hash")
    .single<UserRow>();

  if (error) throw error;
  return data;
}

export async function revokeSessionByToken(token: string) {
  const supabase = getSupabaseAdmin();
  const tokenHash = hashToken(token);
  await supabase.from("pilot_sessions").delete().eq("session_token_hash", tokenHash);
}
