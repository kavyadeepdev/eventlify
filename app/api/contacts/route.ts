import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createContactSchema = z
  .object({
    type: z.string().min(1, "Type is required"),
    title: z.string().min(1, "Title is required"),
    value: z.string().min(1, "Value is required"),
    eventId: z.string().uuid().nullable().optional(),
    clubId: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) =>
      (Boolean(data.eventId) && !data.clubId) ||
      (!data.eventId && Boolean(data.clubId)),
    {
      message: "Contact must belong to either an event or a club (not both, not neither).",
    }
  );

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const clubId = searchParams.get("clubId");

    let contacts;
    if (eventId) {
      contacts = await sql`SELECT * FROM contacts WHERE event_id = ${eventId}`;
    } else if (clubId) {
      contacts = await sql`SELECT * FROM contacts WHERE club_id = ${clubId}`;
    } else {
      contacts = await sql`SELECT * FROM contacts`;
    }

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
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

  const validation = createContactSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { type, title, value, eventId, clubId } = validation.data;

  try {
    const [contact] = await sql`
      INSERT INTO contacts (
        type,
        title,
        value,
        event_id,
        club_id
      ) VALUES (
        ${type},
        ${title},
        ${value},
        ${eventId ?? null},
        ${clubId ?? null}
      )
      RETURNING *
    `;

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/contacts error:", error);
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Specified event or club does not exist." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
