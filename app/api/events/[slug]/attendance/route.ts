import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const attendanceSchema = z
  .object({
    userId: z.string().uuid("Invalid userId UUID").optional(),
    teamId: z.string().uuid("Invalid teamId UUID").optional(),
  })
  .refine((data) => Boolean(data.userId) || Boolean(data.teamId), {
    message: "Either userId or teamId must be provided for attendance check-in.",
  });

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

    const attendances = await sql`
      SELECT a.user_id, a.created_at, u.name as user_name, u.email as user_email
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      WHERE a.event_id = ${event.id}
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({ attendances }, { status: 200 });
  } catch (error) {
    console.error("GET /api/events/[slug]/attendance error:", error);
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

  const validation = attendanceSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { userId, teamId } = validation.data;

  try {
    const [event] = await sql`SELECT id FROM events WHERE slug = ${slug}`;
    if (!event) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Case 1: Check-in by teamId (marks all team members as attended)
    if (teamId) {
      const teamMembers = await sql`
        SELECT user_id FROM team_members WHERE team_id = ${teamId}
      `;

      if (teamMembers.length === 0) {
        return NextResponse.json(
          { error: `No members found for teamId '${teamId}'` },
          { status: 404 }
        );
      }

      // Batch insert attendances for all team members (ignoring duplicate check-ins)
      const userIds = teamMembers.map((m) => m.userId);

      const attendances = await sql`
        INSERT INTO attendances (event_id, user_id)
        SELECT ${event.id}, unnest(${userIds}::uuid[])
        ON CONFLICT (event_id, user_id) DO UPDATE SET created_at = attendances.created_at
        RETURNING event_id, user_id, created_at
      `;

      return NextResponse.json(
        {
          message: `Attendance recorded for team (${userIds.length} members)`,
          teamId,
          attendances,
        },
        { status: 201 }
      );
    }

    // Case 2: Check-in by individual userId
    const [attendance] = await sql`
      INSERT INTO attendances (
        event_id,
        user_id
      ) VALUES (
        ${event.id},
        ${userId!}
      )
      RETURNING *
    `;

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events/[slug]/attendance error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User attendance is already checked in for this event." },
        { status: 409 }
      );
    }
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Invalid user ID or event ID." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
