import { getCurrentUser } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

// This route allows us to check for the user in middleware (edge runtime)
export async function GET(req: NextRequest) {
  // Middleware forwarded the cookie via the authorization header, so pull it out as if the request had come directly from the client
  const jwt = req.headers.get('authorization');
  if (jwt && jwt.length > 0) {
    req.cookies.set('jwt', jwt);
  }

  const user = await getCurrentUser();

  return NextResponse.json({ user });
}
