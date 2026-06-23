import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

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
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, active: true },
    });

    if (!user?.active) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}
