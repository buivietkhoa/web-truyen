import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function getAdminUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}
