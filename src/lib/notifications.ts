import { db } from "@/lib/db";

interface NotifyFavoriteReadersInput {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
}

export async function notifyFavoriteReaders({
  storyId,
  storySlug,
  storyTitle,
  chapterId,
  chapterNumber,
  chapterTitle,
}: NotifyFavoriteReadersInput) {
  const followers = await db.favorite.findMany({
    where: { storyId },
    select: { userId: true },
  });

  if (followers.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: followers.map(({ userId }) => ({
      userId,
      storyId,
      chapterId,
      title: "Truyện có chương mới",
      message: `${storyTitle} vừa cập nhật Chương ${chapterNumber}: ${chapterTitle}`,
      href: `/doc-truyen/${storySlug}/${chapterId}`,
    })),
    skipDuplicates: true,
  });
}
