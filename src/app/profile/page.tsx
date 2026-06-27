import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import FavoriteStoriesCarousel from "@/components/profile/FavoriteStoriesCarousel";
import { FaBookOpen, FaHeart, FaRegUserCircle, FaUser } from "react-icons/fa";
import ReadingHistoryModal from "@/components/profile/ReadingHistoryModal";
import type { ReadingHistoryItem } from "@/components/profile/ReadingHistoryModal";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProfileLogoutButton from "@/components/profile/ProfileLogoutButton";
import UpdateProfileModal from "@/components/profile/UpdateProfileModal";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân - Một Chạm",
};

function formatJoinDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/dang-nhap");
  }

  const [user, readingHistories, favoriteCount, favoriteStories] = await Promise.all([
    db.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        gender: true,
        avatar: true,
        createdAt: true,
      },
    }),
    db.readingHistory.findMany({
      where: {
        userId: currentUser.id,
        story: {
          published: true,
        },
        OR: [
          { chapterId: null },
          {
            chapter: {
              published: true,
            },
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        story: { select: { slug: true, title: true } },
        chapter: { select: { id: true, number: true, title: true } },
      },
    }),
    db.favorite.count({
      where: {
        userId: currentUser.id,
        story: {
          published: true,
        },
      },
    }),
    db.favorite.findMany({
      where: {
        userId: currentUser.id,
        story: {
          published: true,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      include: {
        story: {
          include: {
            chapters: {
              where: {
                published: true,
              },
              orderBy: {
                number: "desc",
              },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/dang-nhap");
  }

  const now = new Date().getTime();

  const historyItems: ReadingHistoryItem[] = readingHistories.map((history) => {
    const elapsedDays = Math.max(
      0,
      Math.round((now - history.updatedAt.getTime()) / 86_400_000)
    );

    return {
      storyId: history.storyId,
      title: history.story.title,
      chapter: history.chapter
        ? `Chương ${history.chapter.number}: ${history.chapter.title}`
        : "Chương đã đọc",
      time: new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(-elapsedDays, "day"),
      progress: history.progress,
      href: history.chapter
        ? `/doc-truyen/${history.story.slug}/${history.chapter.id}`
        : `/truyen/${history.story.slug}`,
    };
  });

  const profileStats = [
    { label: "Truyện đã đọc", value: readingHistories.length.toString(), icon: <FaBookOpen /> },
    { label: "Truyện yêu thích", value: favoriteCount.toString(), icon: <FaHeart /> },
    { label: "Ngày tham gia", value: formatJoinDate(user.createdAt), icon: <FaRegUserCircle /> },
  ];

  return (
    <>
      <SiteHeader activePage="profile" />

      <main className="profile-page">
        <section className="container profile-shell">
          <aside className="profile-sidebar">
            <div className="profile-user-card">
              <AvatarUpload
                currentAvatar={user.avatar || "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&h=160&q=80"}
                userName={user.name}
              />

              <h1>{user.name}</h1>
              <p>Thành viên Một Chạm</p>
            </div>

            <nav className="profile-menu">
              <Link href="/profile" className="active"><FaUser /> Hồ sơ cá nhân</Link>
              <ReadingHistoryModal histories={historyItems} />
              <ProfileLogoutButton />
            </nav>
          </aside>

          <div className="profile-content">
            <div className="profile-stats">
              {profileStats.map((item) => (
                <div className="profile-stat-card" key={item.label}>
                  <div>{item.icon}</div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <section className="profile-info-card">
              <div className="profile-section-head">
                <h2>Thông tin cá nhân</h2>
                <UpdateProfileModal
                  name={user.name}
                  email={user.email}
                  phone={user.phone}
                  gender={user.gender}
                />
              </div>

              <div className="profile-info-grid">
                <label>
                  <span>Họ và tên</span>
                  <input value={user.name} readOnly />
                </label>

                <label>
                  <span>Email</span>
                  <input value={user.email} readOnly />
                </label>

                <label>
                  <span>Số điện thoại</span>
                  <input value={user.phone || "Chưa cập nhật"} readOnly />
                </label>

                <label>
                  <span>Giới tính</span>
                  <input value={user.gender || "Chưa cập nhật"} readOnly />
                </label>
              </div>
            </section>

            <section className="profile-library">
              <div className="profile-section-head">
                <h2>Truyện yêu thích</h2>
                <Link href="/truyen">Xem truyện</Link>
              </div>

              {favoriteStories.length === 0 ? (
                <div className="empty-state">
                  <h2>Chưa có truyện yêu thích</h2>
                  <p>Khi bạn yêu thích truyện, danh sách sẽ hiển thị tại đây.</p>
                  <Link href="/truyen">Khám phá truyện</Link>
                </div>
              ) : (
                <FavoriteStoriesCarousel
                  stories={favoriteStories.map(({ story }) => ({
                    id: story.id,
                    slug: story.slug,
                    title: story.title,
                    coverImage: story.coverImage,
                    latestChapterNumber: story.chapters[0]?.number ?? null,
                  }))}
                />
              )}
            </section>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
