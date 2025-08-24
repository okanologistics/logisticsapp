import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret"
);

interface SessionPayload {
  userId: string;
  email: string;
  role?: string;
}

async function verifyAuth(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) {
    console.log("No token provided");
    return null;
  }
  
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("Verified token payload:", payload);

    const userId = payload.userId as string;
    const email = payload.email as string;
    const role = payload.role as string | undefined;

    if (!userId || !email) {
      console.error("Missing required fields in token payload");
      return null;
    }

    return { userId, email, role };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("Processing request for path:", pathname);

  const token = request.cookies.get("auth_token")?.value;
  const session = await verifyAuth(token);

  if (!session) {
    console.log("No valid session, redirecting to login");
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Get role from session
  const role = session.role || 'investor';
  console.log("Session verified with role:", role);

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      console.log("Non-admin attempting to access admin route");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log("Admin access granted");
  }

  // Handle dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!["investor", "admin"].includes(role)) {
      console.log("Unauthorized user attempting to access dashboard");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log("Dashboard access granted");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
  ]
};
