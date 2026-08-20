import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [user] = await sql`SELECT id, name, slug FROM users WHERE slug = ${slug}`;

    if (!user) {
      return NextResponse.json(
        { error: `User with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Fetch user registrations (direct solo OR via team membership)
    const registrations = await sql`
      SELECT r.id as registration_id, r.mode, r.created_at as registered_at,
             e.id as event_id, e.name as event_name, e.slug as event_slug, e.starts_at, e.ends_at, e.art,
             t.id as team_id, t.name as team_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN teams t ON r.team_id = t.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE r.user_id = ${user.id} OR tm.user_id = ${user.id}
      ORDER BY r.created_at DESC
    `;

    // Fetch user attendance history
    const attendances = await sql`
      SELECT a.created_at as checked_in_at,
             e.id as event_id, e.name as event_name, e.slug as event_slug, e.starts_at, e.ends_at
      FROM attendances a
      JOIN events e ON a.event_id = e.id
      WHERE a.user_id = ${user.id}
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json(
      {
        user,
        registrations,
        attendances,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/users/[slug]/history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
