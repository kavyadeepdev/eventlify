import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  usn: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [user] = await sql`
      SELECT id, name, email, email_verified, image, usn, slug, created_at, updated_at
      FROM users 
      WHERE slug = ${slug}
    `;

    if (!user) {
      return NextResponse.json(
        { error: `User with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[slug] error:", error);
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

  const validation = updateUserSchema.safeParse(body);
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
    const [existingUser] = await sql`SELECT * FROM users WHERE slug = ${slug}`;
    if (!existingUser) {
      return NextResponse.json(
        { error: `User with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const updatedName = data.name ?? existingUser.name;
    const updatedUsn = data.usn !== undefined ? data.usn : existingUser.usn;
    const updatedImage = data.image !== undefined ? data.image : existingUser.image;

    const [updatedUser] = await sql`
      UPDATE users SET
        name = ${updatedName},
        usn = ${updatedUsn},
        image = ${updatedImage},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING id, name, email, email_verified, image, usn, slug, created_at, updated_at
    `;

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/users/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
