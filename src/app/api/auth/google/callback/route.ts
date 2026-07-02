import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  createOAuthLoginResponse,
  getAppOrigin,
  signInOAuthUser,
} from "@/lib/oauth-auth";

const stateCookieName = "google_oauth_state";

interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const savedState = cookieStore.get(stateCookieName)?.value;

    if (!code || !state || !savedState || state !== savedState) {
      console.error("GOOGLE_OAUTH_STATE_MISMATCH", { hasCode: !!code, hasState: !!state, hasSavedState: !!savedState, match: state === savedState });
      return NextResponse.redirect(new URL("/dang-nhap?error=google_state", getAppOrigin()));
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${getAppOrigin()}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("GOOGLE_OAUTH_TOKEN_ERROR", { status: tokenResponse.status, body: tokenError, redirectUri: `${getAppOrigin()}/api/auth/google/callback` });
      return NextResponse.redirect(new URL("/dang-nhap?error=google_token", getAppOrigin()));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = typeof tokenData.access_token === "string" ? tokenData.access_token : "";
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/dang-nhap?error=google_profile", getAppOrigin()));
    }

    const profile = (await userResponse.json()) as GoogleUserInfo;
    if (!profile.email) {
      return NextResponse.redirect(new URL("/dang-nhap?error=google_email", getAppOrigin()));
    }

    const user = await signInOAuthUser({
      email: profile.email,
      name: profile.name || profile.email,
      avatar: profile.picture,
      provider: "GOOGLE",
    });
    const response = createOAuthLoginResponse(user);
    clearOAuthStateCookie(response, stateCookieName);
    return response;
  } catch (error) {
    console.error("GOOGLE_OAUTH_ERROR", error);
    return NextResponse.redirect(new URL("/dang-nhap?error=google", getAppOrigin()));
  }
}
