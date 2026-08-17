import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createEventSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().min(1, "Description is required"),
    art: z.string().nullable().optional(),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    clubId: z.string().uuid("Invalid clubId UUID"),
    minTeamSize: z.number().int().min(1).default(1),
    maxTeamSize: z.number().int().min(1).default(1),
    registrationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid registrationDeadline timestamp"),
    startsAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid startsAt timestamp"),
    endsAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid endsAt timestamp"),
  })
  .refine((data) => data.minTeamSize <= data.maxTeamSize, {
    message: "minTeamSize must be less than or equal to maxTeamSize",
    path: ["minTeamSize"],
  })
  .refine((data) => new Date(data.registrationDeadline) <= new Date(data.startsAt), {
    message: "registrationDeadline must be before or equal to startsAt",
    path: ["registrationDeadline"],
  })
  .refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
    message: "startsAt must be before endsAt",
    path: ["startsAt"],
  });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const clubId = searchParams.get("clubId");

    let events;
    if (search && clubId) {
      events = await sql`
        SELECT * FROM events 
        WHERE club_id = ${clubId} 
          AND (name ILIKE ${"%" + search + "%"} OR description ILIKE ${"%" + search + "%"})
        ORDER BY starts_at ASC
      `;
    } else if (search) {
      events = await sql`
        SELECT * FROM events 
        WHERE name ILIKE ${"%" + search + "%"} OR description ILIKE ${"%" + search + "%"}
        ORDER BY starts_at ASC
      `;
    } else if (clubId) {
      events = await sql`
        SELECT * FROM events 
        WHERE club_id = ${clubId}
        ORDER BY starts_at ASC
      `;
    } else {
      events = await sql`
        SELECT * FROM events 
        ORDER BY starts_at ASC
      `;
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("GET /api/events error:", error);
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

  const validation = createEventSchema.safeParse(body);
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
    const [event] = await sql`
      INSERT INTO events (
        name,
        description,
        art,
        slug,
        club_id,
        min_team_size,
        max_team_size,
        registration_deadline,
        starts_at,
        ends_at
      ) VALUES (
        ${data.name},
        ${data.description},
        ${data.art ?? null},
        ${data.slug},
        ${data.clubId},
        ${data.minTeamSize},
        ${data.maxTeamSize},
        ${new Date(data.registrationDeadline).toISOString()},
        ${new Date(data.startsAt).toISOString()},
        ${new Date(data.endsAt).toISOString()}
      )
      RETURNING *
    `;

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: `An event with slug '${data.slug}' already exists.` },
        { status: 409 }
      );
    }
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Invalid clubId: specified club does not exist." },
        { status: 400 }
      );
    }
    if (error.code === "23514") {
      return NextResponse.json(
        { error: "Invalid team size or dates constraint failed." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
