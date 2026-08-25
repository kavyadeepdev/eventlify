import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing x-api-key header" },
        { status: 401 }
      );
    }

    const [keyRecord] = await sql`
      SELECT * FROM club_api_keys WHERE key_prefix = ${apiKey} OR id::text = ${apiKey} LIMIT 1
    `;

    if (!keyRecord) {
      return NextResponse.json(
        { error: "Invalid API Key" },
        { status: 403 }
      );
    }

    const allowedOrigins = (keyRecord.allowedOrigins as string[]) || [];
    const isAllowed = allowedOrigins.some(
      (allowed) => allowed === "*" || origin.includes(allowed)
    );

    if (allowedOrigins.length > 0 && !isAllowed && !origin.includes("localhost")) {
      return NextResponse.json(
        { error: `Forbidden origin '${origin}' for this API key` },
        { status: 403 }
      );
    }

    await sql`UPDATE club_api_keys SET last_used_at = NOW() WHERE id = ${keyRecord.id}`;

    const events = await sql`
      SELECT * FROM events WHERE club_id = ${keyRecord.clubId} ORDER BY starts_at ASC
    `;

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    return NextResponse.json({ events }, { status: 200, headers });
  } catch (error) {
    console.error("GET /api/v1/public/events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  return new NextResponse(null, { status: 204, headers });
}
