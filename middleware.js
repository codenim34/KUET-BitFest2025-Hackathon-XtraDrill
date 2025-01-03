import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ['user_2r6nKR4A6JG1vSRXXDXWzRaSV6S'];

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  afterAuth(auth, req) {
    // If the user is trying to access an admin route
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Allow access to the admin login page
      if (req.nextUrl.pathname === '/admin') {
        return NextResponse.next();
      }

      // For other admin routes, check if user is authenticated and is an admin
      if (!auth.userId || !ADMIN_USER_IDS.includes(auth.userId)) {
        // Redirect to admin login if not authenticated or not an admin
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    return NextResponse.next();
  },
  publicRoutes: ["/", "sign-in", "sign-up", "/api/webhooks(.*)"],
  ignoredRoutes: ["/api/webhooks(.*)"],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
