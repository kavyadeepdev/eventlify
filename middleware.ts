import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // Exclude static assets, api routes, auth pages, and Next.js internal files
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/onboard") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract subdomain (e.g. admin.localhost:3000 -> admin, club.eventlify.in -> club)
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  
  // Extract host prefix before domain
  let subdomain = "";
  if (host.includes(".")) {
    const parts = host.split(".");
    if (isLocal && parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "127") {
      subdomain = parts[0];
    } else if (!isLocal && parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Subdomain routing rewrites
  if (subdomain === "admin" && !url.pathname.startsWith("/admin")) {
    url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (subdomain === "club" && !url.pathname.startsWith("/club")) {
    url.pathname = `/club${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
