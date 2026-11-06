import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "tn-samacheer-kalvi-coe-super-secret-key-2026-secure-32chars"
);

export const COOKIE_NAME = "exam_portal_session";

// 100 years permanent duration in seconds (never expires)
const ONE_HUNDRED_YEARS_SECS = Math.floor(100 * 365.25 * 24 * 60 * 60);

/**
 * Sign a new session token that never expires (100 years duration)
 * @param {Object} payload 
 * @returns {Promise<string>}
 */
export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("100y") // Permanent lifetime: 100 years
    .sign(SESSION_SECRET);
}

/**
 * Verify a session token
 * @param {string} token 
 * @returns {Promise<Object|null>}
 */
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current session from Next.js server cookie store
 * @returns {Promise<Object|null>}
 */
export async function getCurrentSession() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  return await verifySession(sessionToken);
}

/**
 * Attach permanent session cookie to response (never expires)
 * @returns {Object} cookie options
 */
export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_HUNDRED_YEARS_SECS, // Permanent session: 100 years
    expires: new Date(Date.now() + ONE_HUNDRED_YEARS_SECS * 1000),
  };
}
