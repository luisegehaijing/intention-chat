import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { getHistoryPayload } from "@/lib/server/status-data";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getHistoryPayload(user.email);
  return NextResponse.json(result.body, { status: result.status });
}
