import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let users;
    if (search) {
      users = await sql`
        SELECT id, name, email, email_verified, image, usn, slug, created_at, updated_at
        FROM users 
        WHERE name ILIKE ${"%" + search + "%"} 
           OR email ILIKE ${"%" + search + "%"} 
           OR usn ILIKE ${"%" + search + "%"}
        ORDER BY name ASC
      `;
    } else {
      users = await sql`
        SELECT id, name, email, email_verified, image, usn, slug, created_at, updated_at
        FROM users 
        ORDER BY name ASC
      `;
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
