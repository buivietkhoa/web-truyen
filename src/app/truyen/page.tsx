import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { db } from "@/lib/db";

export default async function DanhSachTruyenPage() {
  const stories = await db.story.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      chapters: {
        orderBy: {
          number: "desc",
        },
        take: 1,
      },
    },
  });

  return (
    <>
      <SiteHeader activePage="updates" />

      <main className="updates-page">
        <section className="updates-container">
          <div className="updates-toolbar">
            <h1>Mới cập nhật</h1>
          </div>

          {stories.length === 0 ? (
            <div className="empty-state">
              <h2>Chưa có truyện nào</h2>
              <p>Admin có thể thêm truyện trong trang quản trị. Khi có dữ liệu, truyện sẽ xuất hiện ở đây.</p>
              <Link href="/admin/truyen">Vào quản trị truyện</Link>
            </div>
          ) : (
            <div className="updates-grid">
              {stories.map((story) => (
                <Link href={`/truyen/${story.slug}`} className="update-card" key={story.id}>
                  <div className="update-cover image-skeleton">
                    <img src={story.coverImage} alt={story.title} loading="lazy" />
                    <span>{story.category.toUpperCase()}</span>
                  </div>

                  <div className="update-info">
                    <h2>{story.title}</h2>
                    <div>
                      <p>{story.chapters[0] ? `Chương ${story.chapters[0].number}` : "Chưa có chương"}</p>
                      <small>{story.updatedAt.toLocaleDateString("vi-VN")}</small>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
