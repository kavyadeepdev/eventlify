import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const events = await sql`SELECT * FROM events`;
  console.log(events);
  if (!events)
    return NextResponse.json(
      {
        error: `Failed to fetch events`,
      },
      { status: 404 },
    );
  return NextResponse.json({ events });
}
