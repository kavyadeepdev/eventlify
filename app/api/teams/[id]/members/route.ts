import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addTeamMemberSchema = z.object({
  userId: z.string().uuid("Invalid userId UUID"),
  role: z.string().min(1, "Role is required").default("MEMBER"),
});

const removeTeamMemberSchema = z.object({
  userId: z.string().uuid("Invalid userId UUID"),
});

export async function POST(
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

  const validation = addTeamMemberSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { userId, role } = validation.data;

  try {
    const [team] = await sql`SELECT id FROM teams WHERE id = ${id}`;
    if (!team) {
      return NextResponse.json(
        { error: `Team with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const [member] = await sql`
      INSERT INTO team_members (
        team_id,
        user_id,
        role
      ) VALUES (
        ${id},
        ${userId},
        ${role}
      )
      RETURNING *
    `;

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/teams/[id]/members error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User is already a member of this team." },
        { status: 409 }
      );
    }
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Invalid user ID or team ID." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get("userId");

  if (!userId) {
    try {
      const body = await req.json();
      const validation = removeTeamMemberSchema.safeParse(body);
      if (validation.success) {
        userId = validation.data.userId;
      }
    } catch {
      // Ignored if no body provided
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required query parameter or body field: userId" },
      { status: 400 }
    );
  }

  try {
    const [deletedMember] = await sql`
      DELETE FROM team_members 
      WHERE team_id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!deletedMember) {
      return NextResponse.json(
        { error: "Member not found in this team." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Member removed from team successfully", userId, teamId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/teams/[id]/members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
