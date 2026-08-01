import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/events/[slug]">,
) {
  const { slug } = await ctx.params;
  return NextResponse.json({ message: `Hello from ${slug}` });
}

export async function POST() {}
