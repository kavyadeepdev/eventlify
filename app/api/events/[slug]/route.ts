import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/events/[slug]">
) {
  try {

    const { slug } = await ctx.params;
    const [event] = await sql`SELECT * FROM events WHERE slug = ${slug}`;
    // 404 error
    if (!event)
      return NextResponse.json(
        {
          error: `Event ${slug} not found`,
        },
        { status: 404 },
      );
    // 200 success
    return NextResponse.json(
      {
        event,
      },
      { status: 200 });
  } catch (error) {
    // 500 error
    console.error("GET /api/events/[slug] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/events/[slug]">,
) {
  // JSON body parsing
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body payload" },
      { status: 400 }
    );
  }

  // Field validation
  const { slug } = await ctx.params;
  const {
    name,
    description,
    art,
    minTeamSize,
    maxTeamSize,
    registrationDeadline,
    startsAt,
    endsAt,
    clubId,
  } = body;

  if (!name || !description || !clubId) {
    return NextResponse.json(
      { error: "Missing required fields: name, description, and clubId are required." },
      { status: 400 }
    );
  }

  try {
    const [event] = await sql`
      INSERT INTO events (
        name,
        description,
        art,
        min_team_size,
        max_team_size,
        registration_deadline,
        starts_at,
        ends_at,
        club_id,
        slug
      ) VALUES (
        ${name},
        ${description},
        ${art ?? null},
        ${minTeamSize ?? 1},
        ${maxTeamSize ?? 1},
        ${registrationDeadline},
        ${startsAt},
        ${endsAt},
        ${clubId},
        ${slug}
      )
      RETURNING *
    `;

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    // Database constraint handling
    console.error("POST /api/events/[slug] error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: `An event with slug '${slug}' already exists.` },
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

    console.error("POST /api/events/[slug] error:", error)
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
