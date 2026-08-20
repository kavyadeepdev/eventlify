import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid userId UUID"),
  role: z.string().min(1, "Role is required").default("MEMBER"),
});

const removeMemberSchema = z.object({
  userId: z.string().uuid("Invalid userId UUID"),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [club] = await sql`SELECT id FROM clubs WHERE slug = ${slug}`;

    if (!club) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const members = await sql`
      SELECT cm.role, cm.created_at, u.id as user_id, u.name, u.email, u.image
      FROM club_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.club_id = ${club.id}
      ORDER BY cm.created_at ASC
    `;

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("GET /api/clubs/[slug]/members error:", error);
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

  const validation = addMemberSchema.safeParse(body);
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
    const [club] = await sql`SELECT id FROM clubs WHERE slug = ${slug}`;
    if (!club) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const [member] = await sql`
      INSERT INTO club_members (
        club_id,
        user_id,
        role
      ) VALUES (
        ${club.id},
        ${userId},
        ${role}
      )
      RETURNING *
    `;

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/clubs/[slug]/members error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User is already a member of this club." },
        { status: 409 }
      );
    }
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Invalid user ID or club ID." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add club member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get("userId");

  if (!userId) {
    try {
      const body = await req.json();
      const validation = removeMemberSchema.safeParse(body);
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
    const [club] = await sql`SELECT id FROM clubs WHERE slug = ${slug}`;
    if (!club) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const [deletedMember] = await sql`
      DELETE FROM club_members 
      WHERE club_id = ${club.id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!deletedMember) {
      return NextResponse.json(
        { error: "Member not found in this club." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Member removed from club successfully", userId },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/clubs/[slug]/members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
