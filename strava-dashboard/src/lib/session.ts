import { cookies } from "next/headers";
import { refreshAccessToken, type TokenData } from "./strava";

const SESSION_COOKIE = "strava_session";

export async function getSession(): Promise<TokenData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const session: TokenData = JSON.parse(raw);

    // Refresh token if expired
    if (Date.now() / 1000 > session.expires_at - 600) {
      const refreshed = await refreshAccessToken(session.refresh_token);
      const updated: TokenData = {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: refreshed.expires_at,
        athlete: session.athlete,
      };
      await setSession(updated);
      return updated;
    }

    return session;
  } catch {
    return null;
  }
}

export async function setSession(data: TokenData) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
