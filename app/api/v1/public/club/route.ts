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

    // Verify key in database
    const [keyRecord] = await sql`
      SELECT * FROM club_api_keys WHERE key_prefix = ${apiKey} OR id::text = ${apiKey} LIMIT 1
    `;

    if (!keyRecord) {
      return NextResponse.json(
        { error: "Invalid API Key" },
        { status: 403 }
      );
    }

    // CORS Origin Check
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

    // Update last used timestamp
    await sql`UPDATE club_api_keys SET last_used_at = NOW() WHERE id = ${keyRecord.id}`;

    // Fetch club profile
    const [club] = await sql`
      SELECT id, name, description, logo, slug, status, created_at, updated_at
      FROM clubs WHERE id = ${keyRecord.clubId}
    `;

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const members = await sql`
      SELECT cm.role, cm.created_at, u.name, u.email, u.image
      FROM club_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.club_id = ${club.id}
    `;

    const contacts = await sql`SELECT id, type, title, value FROM contacts WHERE club_id = ${club.id}`;
    const links = await sql`SELECT id, type, title, url FROM links WHERE club_id = ${club.id}`;

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");

    return NextResponse.json(
      { club, members, contacts, links },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("GET /api/v1/public/club error:", error);
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
