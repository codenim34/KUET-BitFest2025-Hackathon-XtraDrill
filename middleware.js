import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ['user_2r6nKR4A6JG1vSRXXDXWzRaSV6S', 'user_2r6n5oSeNHtUf27FZHxhu9yCXxQ', 'user_2qL5YAi2C3byqT4QyZqK5t8CYr5'];

export default authMiddleware({
  publicRoutes: [
    "/",                    // Landing page       
    "/sign-in", 
    "/api/transliterate",   // Auth pages
    "/sign-up",
    "/api/stories",         // Allow public access to stories API
    "/api/stories/(.*)",    // Allow access to all story-related endpoints
    "/api/bengali-chat",    // Bengali chat endpoints
    "/api/bengali-chat/(.*)",
    "/api/bengali-chat-history",
    "/api/bengali-chat-history/(.*)",
  ],
  ignoredRoutes: ["/api/webhooks(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
