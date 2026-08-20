import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateContactSchema = z.object({
  type: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [contact] = await sql`SELECT * FROM contacts WHERE id = ${id}`;

    if (!contact) {
      return NextResponse.json(
        { error: `Contact with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact }, { status: 200 });
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);
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

  const validation = updateContactSchema.safeParse(body);
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
    const [existingContact] = await sql`SELECT * FROM contacts WHERE id = ${id}`;
    if (!existingContact) {
      return NextResponse.json(
        { error: `Contact with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const updatedType = data.type ?? existingContact.type;
    const updatedTitle = data.title ?? existingContact.title;
    const updatedValue = data.value ?? existingContact.value;

    const [updatedContact] = await sql`
      UPDATE contacts SET
        type = ${updatedType},
        title = ${updatedTitle},
        value = ${updatedValue},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ contact: updatedContact }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
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
    const [deletedContact] = await sql`
      DELETE FROM contacts WHERE id = ${id} RETURNING *
    `;

    if (!deletedContact) {
      return NextResponse.json(
        { error: `Contact with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Contact '${id}' deleted successfully`, id },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
