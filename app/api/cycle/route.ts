import { NextResponse } from "next/server";
import { getCurrentCycleInfo } from "@/lib/server/cycle";

export async function GET() {
  return NextResponse.json(getCurrentCycleInfo());
}
