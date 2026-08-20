import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [club] = await sql`SELECT id, name, slug FROM clubs WHERE slug = ${slug}`;

    if (!club) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const events = await sql`
      SELECT * FROM events 
      WHERE club_id = ${club.id}
      ORDER BY starts_at ASC
    `;

    return NextResponse.json(
      {
        club: {
          id: club.id,
          name: club.name,
          slug: club.slug,
        },
        events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/clubs/[slug]/events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
