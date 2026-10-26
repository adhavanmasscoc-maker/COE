import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "tn-samacheer-kalvi-coe-super-secret-key-2026-secure-32chars"
);

const COOKIE_NAME = "exam_portal_session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /student, /coe-admin, and /api/admin paths
  const isStudentRoute = pathname.startsWith("/student");
  const isCOERoute = pathname.startsWith("/coe-admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isStudentRoute && !isCOERoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Allow read-only COE preview for student routes with previewRollNo parameter
  const hasPreviewRoll = request.nextUrl.searchParams.has("previewRollNo");
  if (isStudentRoute && hasPreviewRoll) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: "Access denied. Administrator session required." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "authentication_required");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(sessionToken, SESSION_SECRET);

    // COE Admin route guard: Strictly require ADMIN role
    if ((isCOERoute || isAdminApiRoute) && payload.role !== "ADMIN") {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Access denied. Administrator privileges required." },
          { status: 403 }
        );
      }
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "admin_access_denied");
      return NextResponse.redirect(homeUrl);
    }

    // Student route guard: Allow STUDENTS (and allow ADMIN to preview)
    if (isStudentRoute && payload.role !== "STUDENT" && payload.role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "student_access_denied");
      return NextResponse.redirect(homeUrl);
    }

    // Attach verified session header for downstream usage
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId);
    response.headers.set("x-user-role", payload.role);
    return response;
  } catch (err) {
    // Token tampered with or expired
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: "Session expired or invalid." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("reason", "session_expired");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/coe-admin",
    "/coe-admin/:path*",
    "/student",
    "/student/:path*",
    "/api/admin/:path*",
  ],
};
