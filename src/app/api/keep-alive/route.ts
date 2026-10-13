import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Pinged daily by Vercel Cron (see vercel.json) purely to generate
 * database activity — Supabase's free tier auto-pauses a project after
 * 7 days with none, which took the app down in production. Gated by
 * CRON_SECRET (set in Vercel env vars), which Vercel automatically sends
 * as a Bearer token when it invokes a configured cron job, so this
 * can't be hit/abused by anyone else. */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
