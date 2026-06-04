import SiteHeaderClient, { type ActivePage } from "@/components/layout/SiteHeaderClient";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface SiteHeaderProps {
  activePage?: ActivePage;
}

export default async function SiteHeader({ activePage }: SiteHeaderProps) {
  const currentUser = await getCurrentUser();
  let userName = "";

  if (currentUser) {
    const user = await db.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        name: true,
      },
    });

    userName = user?.name || "";
  }

  return <SiteHeaderClient activePage={activePage} initialUserName={userName} />;
}
