import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/dang-nhap");
  }

  const user = await db.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      name: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminShell userName={user.name}>{children}</AdminShell>;
}
