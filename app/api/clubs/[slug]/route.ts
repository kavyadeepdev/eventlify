import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateClubSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  logo: z.string().nullable().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [club] = await sql`SELECT * FROM clubs WHERE slug = ${slug}`;

    if (!club) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Fetch members with user details
    const members = await sql`
      SELECT cm.role, cm.created_at, u.id as user_id, u.name, u.email, u.image
      FROM club_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.club_id = ${club.id}
      ORDER BY cm.created_at ASC
    `;

    // Fetch associated contacts & links
    const contacts = await sql`SELECT id, type, title, value FROM contacts WHERE club_id = ${club.id}`;
    const links = await sql`SELECT id, type, title, url FROM links WHERE club_id = ${club.id}`;

    return NextResponse.json(
      {
        club,
        members,
        contacts,
        links,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/clubs/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

  const validation = updateClubSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validation.data;

  try {
    const [existingClub] = await sql`SELECT * FROM clubs WHERE slug = ${slug}`;
    if (!existingClub) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const updatedName = data.name ?? existingClub.name;
    const updatedDescription = data.description ?? existingClub.description;
    const updatedLogo = data.logo !== undefined ? data.logo : existingClub.logo;
    const updatedSlug = data.slug ?? existingClub.slug;

    const [updatedClub] = await sql`
      UPDATE clubs SET
        name = ${updatedName},
        description = ${updatedDescription},
        logo = ${updatedLogo},
        slug = ${updatedSlug},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING *
    `;

    return NextResponse.json({ club: updatedClub }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/clubs/[slug] error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A club with slug '${data.slug}' already exists.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update club" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [existingClub] = await sql`SELECT id FROM clubs WHERE slug = ${slug}`;

    if (!existingClub) {
      return NextResponse.json(
        { error: `Club with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Delete associated contacts, links, club_members first
    await sql`DELETE FROM contacts WHERE club_id = ${existingClub.id}`;
    await sql`DELETE FROM links WHERE club_id = ${existingClub.id}`;
    await sql`DELETE FROM club_members WHERE club_id = ${existingClub.id}`;

    // Delete club
    await sql`DELETE FROM clubs WHERE id = ${existingClub.id}`;

    return NextResponse.json(
      { message: `Club '${slug}' deleted successfully`, slug },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/clubs/[slug] error:", error);
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Cannot delete club with existing events. Remove or reassign events first." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
