import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  mode: z.enum(["SOLO", "TEAM"]),
  userId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
}).refine(
  (data) =>
    (data.mode === "SOLO" && Boolean(data.userId) && !data.teamId) ||
    (data.mode === "TEAM" && Boolean(data.teamId) && !data.userId),
  {
    message: "SOLO mode requires userId, TEAM mode requires teamId",
  }
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [event] = await sql`SELECT id FROM events WHERE slug = ${slug}`;

    if (!event) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const registrations = await sql`
      SELECT r.id, r.mode, r.created_at, r.user_id, r.team_id,
             u.name as user_name, u.email as user_email,
             t.name as team_name
      FROM registrations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN teams t ON r.team_id = t.id
      WHERE r.event_id = ${event.id}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json({ registrations }, { status: 200 });
  } catch (error) {
    console.error("GET /api/events/[slug]/register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body payload" },
      { status: 400 }
    );
  }

  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { mode, userId, teamId } = validation.data;

  try {
    const [event] = await sql`SELECT id, registration_deadline FROM events WHERE slug = ${slug}`;
    if (!event) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json(
        { error: "Registration deadline has passed for this event." },
        { status: 400 }
      );
    }

    const [registration] = await sql`
      INSERT INTO registrations (
        event_id,
        user_id,
        team_id,
        mode
      ) VALUES (
        ${event.id},
        ${userId ?? null},
        ${teamId ?? null},
        ${mode}
      )
      RETURNING *
    `;

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events/[slug]/register error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User or Team is already registered for this event." },
        { status: 409 }
      );
    }
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Invalid user or team ID." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
