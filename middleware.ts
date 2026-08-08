import { auth } from "./auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes - no auth required
  const publicRoutes = ["/", "/auth/signin", "/auth/error", "/api/chemicals"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Protected routes
  const session = await auth();
  
  // Require authentication for dashboard and admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }
  
  // Require editor/admin role for edit routes
  if (pathname.startsWith("/chemical/new") || pathname.startsWith("/chemical/edit")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    // Check if user has editor or admin role
    if (session.user.role === "viewer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
