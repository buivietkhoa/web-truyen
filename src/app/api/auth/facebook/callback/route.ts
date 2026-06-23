import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  createOAuthLoginResponse,
  getAppOrigin,
  signInOAuthUser,
} from "@/lib/oauth-auth";

const stateCookieName = "facebook_oauth_state";

interface FacebookProfile {
  id?: string;
  email?: string;
  name?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const savedState = cookieStore.get(stateCookieName)?.value;

    if (!code || !state || !savedState || state !== savedState) {
      return NextResponse.redirect(new URL("/dang-nhap?error=facebook_state", getAppOrigin()));
    }

    const redirectUri = `${getAppOrigin()}/api/auth/facebook/callback`;
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID || "");
    tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET || "");
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl);
    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL("/dang-nhap?error=facebook_token", getAppOrigin()));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = typeof tokenData.access_token === "string" ? tokenData.access_token : "";
    const profileUrl = new URL("https://graph.facebook.com/me");
    profileUrl.searchParams.set("fields", "id,name,picture");
    profileUrl.searchParams.set("access_token", accessToken);

    const profileResponse = await fetch(profileUrl);
    if (!profileResponse.ok) {
      return NextResponse.redirect(new URL("/dang-nhap?error=facebook_profile", getAppOrigin()));
    }

    const profile = (await profileResponse.json()) as FacebookProfile;
    if (!profile.id) {
      return NextResponse.redirect(new URL("/dang-nhap?error=facebook_email", getAppOrigin()));
    }

    const email = profile.email || `facebook-${profile.id}@motcham.local`;
    const user = await signInOAuthUser({
      email,
      name: profile.name || `Facebook ${profile.id}`,
      avatar: profile.picture?.data?.url,
      provider: "FACEBOOK",
    });
    const response = createOAuthLoginResponse(user);
    clearOAuthStateCookie(response, stateCookieName);
    return response;
  } catch (error) {
    console.error("FACEBOOK_OAUTH_ERROR", error);
    return NextResponse.redirect(new URL("/dang-nhap?error=facebook", getAppOrigin()));
  }
}
