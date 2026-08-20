import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateLinkSchema = z.object({
  type: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  url: z.string().url("Invalid URL format").optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [link] = await sql`SELECT * FROM links WHERE id = ${id}`;

    if (!link) {
      return NextResponse.json(
        { error: `Link with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ link }, { status: 200 });
  } catch (error) {
    console.error("GET /api/links/[id] error:", error);
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

  const validation = updateLinkSchema.safeParse(body);
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
    const [existingLink] = await sql`SELECT * FROM links WHERE id = ${id}`;
    if (!existingLink) {
      return NextResponse.json(
        { error: `Link with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const updatedType = data.type ?? existingLink.type;
    const updatedTitle = data.title ?? existingLink.title;
    const updatedUrl = data.url ?? existingLink.url;

    const [updatedLink] = await sql`
      UPDATE links SET
        type = ${updatedType},
        title = ${updatedTitle},
        url = ${updatedUrl},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ link: updatedLink }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/links/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
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
    const [deletedLink] = await sql`
      DELETE FROM links WHERE id = ${id} RETURNING *
    `;

    if (!deletedLink) {
      return NextResponse.json(
        { error: `Link with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Link '${id}' deleted successfully`, id },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/links/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
