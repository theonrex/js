import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get the request hostname (e.g. demo.thirdweb.com)
  const hostname = req.headers.get("host");

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /assets, /details)
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // keep root application at `/`
  if (hostname === ROOT_DOMAIN || hostname === null) {
    return NextResponse.rewrite(
      new URL(`/${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite everything else to `/[ecosystem]/... dynamic route
  const ecosystem = hostname.split(".")[0];

  // If the user is logged in, send them to their wallet page
  const userResponse = await fetch(
    `${ROOT_DOMAIN?.includes("localhost") ? "http" : "https"}://${ROOT_DOMAIN}/api/user`,
    {
      method: "GET",
      headers: {
        Authorization: req.cookies.get("jwt")?.value ?? "",
      },
    },
  );
  if (!userResponse.ok) {
    throw new Error("Failed to check for logged in user");
  }
  const { user } = await userResponse.json();

  if (user) {
    return NextResponse.rewrite(
      new URL(`/${ecosystem}/wallet/${user}?${searchParams}`, req.url),
    );
  }

  return NextResponse.rewrite(new URL(`/${ecosystem}/login`, req.url));
}
