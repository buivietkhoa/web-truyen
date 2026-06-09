import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { FaBookOpen, FaEdit, FaHeart, FaRegUserCircle, FaUser } from "react-icons/fa";
import ReadingHistoryModal from "@/components/profile/ReadingHistoryModal";
import UpdateProfileModal from "@/components/profile/UpdateProfileModal";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân - Mọt Chạm",
};

function formatJoinDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/dang-nhap");
  }

  const [user, readingCount, favoriteCount, favoriteStories] = await Promise.all([
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
    db.readingHistory.count({
      where: {
        userId: currentUser.id,
      },
    }),
    db.favorite.count({
      where: {
        userId: currentUser.id,
      },
    }),
    db.favorite.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      include: {
        story: {
          include: {
            chapters: {
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

  const profileStats = [
    { label: "Truyện đã đọc", value: readingCount.toString(), icon: <FaBookOpen /> },
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
              <div className="profile-avatar">
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&h=160&q=80"}
                  alt={user.name}
                />
                <button type="button" aria-label="Cập nhật ảnh đại diện">
                  <FaEdit />
                </button>
              </div>

              <h1>{user.name}</h1>
              <p>Thành viên Mọt Chạm</p>
            </div>

            <nav className="profile-menu">
              <Link href="/profile" className="active"><FaUser /> Hồ sơ cá nhân</Link>
              <ReadingHistoryModal />
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
                <div className="profile-story-grid">
                  {favoriteStories.map(({ story }) => (
                    <Link href={`/truyen/${story.slug}`} className="profile-story-card" key={story.id}>
                      <img src={story.coverImage} alt={story.title} loading="lazy" />
                      <h3>{story.title}</h3>
                      <p>{story.chapters[0] ? `Chương ${story.chapters[0].number}` : "Chưa có chương"}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
