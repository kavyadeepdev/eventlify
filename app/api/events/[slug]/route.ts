import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateEventSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    art: z.string().nullable().optional(),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
      .optional(),
    clubId: z.string().uuid().optional(),
    minTeamSize: z.number().int().min(1).optional(),
    maxTeamSize: z.number().int().min(1).optional(),
    registrationDeadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid registrationDeadline timestamp")
      .optional(),
    startsAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid startsAt timestamp")
      .optional(),
    endsAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid endsAt timestamp")
      .optional(),
  });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [event] = await sql`SELECT * FROM events WHERE slug = ${slug}`;

    if (!event) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Fetch hosting club details
    const [club] = await sql`SELECT id, name, description, logo, slug FROM clubs WHERE id = ${event.clubId}`;

    // Fetch associated contacts & links
    const contacts = await sql`SELECT id, type, title, value FROM contacts WHERE event_id = ${event.id}`;
    const links = await sql`SELECT id, type, title, url FROM links WHERE event_id = ${event.id}`;

    return NextResponse.json(
      {
        event,
        club: club ?? null,
        contacts,
        links,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/events/[slug] error:", error);
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

  const validation = updateEventSchema.safeParse(body);
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
    const [existingEvent] = await sql`SELECT * FROM events WHERE slug = ${slug}`;
    if (!existingEvent) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    const updatedName = data.name ?? existingEvent.name;
    const updatedDescription = data.description ?? existingEvent.description;
    const updatedArt = data.art !== undefined ? data.art : existingEvent.art;
    const updatedSlug = data.slug ?? existingEvent.slug;
    const updatedClubId = data.clubId ?? existingEvent.clubId;
    const updatedMinTeamSize = data.minTeamSize ?? existingEvent.minTeamSize;
    const updatedMaxTeamSize = data.maxTeamSize ?? existingEvent.maxTeamSize;
    const updatedDeadline = data.registrationDeadline
      ? new Date(data.registrationDeadline).toISOString()
      : existingEvent.registrationDeadline;
    const updatedStartsAt = data.startsAt
      ? new Date(data.startsAt).toISOString()
      : existingEvent.startsAt;
    const updatedEndsAt = data.endsAt
      ? new Date(data.endsAt).toISOString()
      : existingEvent.endsAt;

    // Validate date constraints
    if (new Date(updatedDeadline) > new Date(updatedStartsAt)) {
      return NextResponse.json(
        { error: "registrationDeadline must be before or equal to startsAt" },
        { status: 400 }
      );
    }
    if (new Date(updatedStartsAt) >= new Date(updatedEndsAt)) {
      return NextResponse.json(
        { error: "startsAt must be before endsAt" },
        { status: 400 }
      );
    }
    if (updatedMinTeamSize > updatedMaxTeamSize) {
      return NextResponse.json(
        { error: "minTeamSize must be less than or equal to maxTeamSize" },
        { status: 400 }
      );
    }

    const [updatedEvent] = await sql`
      UPDATE events SET
        name = ${updatedName},
        description = ${updatedDescription},
        art = ${updatedArt},
        slug = ${updatedSlug},
        club_id = ${updatedClubId},
        min_team_size = ${updatedMinTeamSize},
        max_team_size = ${updatedMaxTeamSize},
        registration_deadline = ${updatedDeadline},
        starts_at = ${updatedStartsAt},
        ends_at = ${updatedEndsAt},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING *
    `;

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/events/[slug] error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `An event with slug '${data.slug}' already exists.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update event" },
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
    const [existingEvent] = await sql`SELECT id FROM events WHERE slug = ${slug}`;

    if (!existingEvent) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Delete associated contacts & links first
    await sql`DELETE FROM contacts WHERE event_id = ${existingEvent.id}`;
    await sql`DELETE FROM links WHERE event_id = ${existingEvent.id}`;
    await sql`DELETE FROM attendances WHERE event_id = ${existingEvent.id}`;
    await sql`DELETE FROM registrations WHERE event_id = ${existingEvent.id}`;

    // Delete event
    await sql`DELETE FROM events WHERE id = ${existingEvent.id}`;

    return NextResponse.json(
      { message: `Event '${slug}' deleted successfully`, slug },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/events/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
