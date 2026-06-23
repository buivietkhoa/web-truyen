import crypto from "crypto";
import { NextResponse } from "next/server";
import { createOAuthStateCookie, getAppOrigin } from "@/lib/oauth-auth";

const stateCookieName = "google_oauth_state";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(new URL("/dang-nhap?error=google_config", getAppOrigin()));
  }

  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = `${getAppOrigin()}/api/auth/google/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  createOAuthStateCookie(response, stateCookieName, state);
  return response;
}
