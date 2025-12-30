import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all workspace and task routes
        if (req.nextUrl.pathname.startsWith("/workspaces") || 
            req.nextUrl.pathname.startsWith("/tasks")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/workspaces/:path*",
    "/tasks/:path*",
    "/dashboard/:path*",
    "/statistics/:path*",
  ],
}

