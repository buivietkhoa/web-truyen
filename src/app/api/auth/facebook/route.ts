import crypto from "crypto";
import { NextResponse } from "next/server";
import { createOAuthStateCookie, getAppOrigin } from "@/lib/oauth-auth";

const stateCookieName = "facebook_oauth_state";

export async function GET() {
  const clientId = process.env.FACEBOOK_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(new URL("/dang-nhap?error=facebook_config", getAppOrigin()));
  }

  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = `${getAppOrigin()}/api/auth/facebook/callback`;
  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "public_profile");

  const response = NextResponse.redirect(authUrl);
  createOAuthStateCookie(response, stateCookieName, state);
  return response;
}
