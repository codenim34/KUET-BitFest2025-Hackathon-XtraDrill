import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ['user_2r6nKR4A6JG1vSRXXDXWzRaSV6S'];

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    "/",                    // Landing page       // Individual public story views
    "/sign-in",           // Auth pages
    "/sign-up"
  ],
  ignoredRoutes: ["/api/webhooks(.*)"],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
