import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type TokenPayload = {
  id: string;
  email: string;
  role: string;
};

export async function getCurrentUser() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}
