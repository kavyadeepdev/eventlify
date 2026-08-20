import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [team] = await sql`SELECT * FROM teams WHERE id = ${id}`;

    if (!team) {
      return NextResponse.json(
        { error: `Team with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const members = await sql`
      SELECT tm.role, tm.created_at, u.id as user_id, u.name, u.email, u.image
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ${team.id}
      ORDER BY tm.created_at ASC
    `;

    return NextResponse.json({ team, members }, { status: 200 });
  } catch (error) {
    console.error("GET /api/teams/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body payload" },
      { status: 400 }
    );
  }

  const validation = updateTeamSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { name } = validation.data;

  try {
    const [team] = await sql`
      UPDATE teams SET
        name = ${name},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!team) {
      return NextResponse.json(
        { error: `Team with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ team }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/teams/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [existingTeam] = await sql`SELECT id FROM teams WHERE id = ${id}`;

    if (!existingTeam) {
      return NextResponse.json(
        { error: `Team with ID '${id}' not found` },
        { status: 404 }
      );
    }

    // Delete team members & registrations first
    await sql`DELETE FROM team_members WHERE team_id = ${id}`;
    await sql`DELETE FROM registrations WHERE team_id = ${id}`;
    await sql`DELETE FROM teams WHERE id = ${id}`;

    return NextResponse.json(
      { message: `Team '${id}' deleted successfully`, id },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/teams/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
