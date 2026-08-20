import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createClubSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required"),
  logo: z.string().nullable().optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let clubs;
    if (search) {
      clubs = await sql`
        SELECT * FROM clubs 
        WHERE name ILIKE ${"%" + search + "%"} OR description ILIKE ${"%" + search + "%"}
        ORDER BY name ASC
      `;
    } else {
      clubs = await sql`
        SELECT * FROM clubs 
        ORDER BY name ASC
      `;
    }

    return NextResponse.json({ clubs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/clubs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body payload" },
      { status: 400 }
    );
  }

  const validation = createClubSchema.safeParse(body);
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
    const [club] = await sql`
      INSERT INTO clubs (
        name,
        description,
        logo,
        slug
      ) VALUES (
        ${data.name},
        ${data.description},
        ${data.logo ?? null},
        ${data.slug}
      )
      RETURNING *
    `;

    return NextResponse.json({ club }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/clubs error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A club with slug '${data.slug}' already exists.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 }
    );
  }
}
