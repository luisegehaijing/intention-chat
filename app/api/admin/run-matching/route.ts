import { NextResponse } from "next/server";
import { getCurrentCycleInfo } from "@/lib/server/cycle";
import { runMatchingForCycle } from "@/lib/server/matcher";

function isAuthorized(req: Request) {
  const adminKey = process.env.ADMIN_DASHBOARD_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const header = req.headers.get("x-admin-key");
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");

  return Boolean(
    (adminKey && (header === adminKey || bearer === adminKey)) ||
      (cronSecret && (header === cronSecret || bearer === cronSecret))
  );
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { cycleKey } = getCurrentCycleInfo();
    const result = await runMatchingForCycle(cycleKey);
    return NextResponse.json({ ok: true, cycleKey, ...result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
