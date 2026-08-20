import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let teams;
    if (search) {
      teams = await sql`
        SELECT * FROM teams 
        WHERE name ILIKE ${"%" + search + "%"} 
        ORDER BY created_at DESC
      `;
    } else {
      teams = await sql`
        SELECT * FROM teams 
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    console.error("GET /api/teams error:", error);
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

  const validation = createTeamSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { name } = validation.data;

  try {
    const [team] = await sql`
      INSERT INTO teams (name)
      VALUES (${name})
      RETURNING *
    `;

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
