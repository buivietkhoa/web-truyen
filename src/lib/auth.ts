import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type TokenPayload = {
  id: string;
  email: string;
  role: string;
};

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    return decoded;
  } catch {
    return null;
  }
}