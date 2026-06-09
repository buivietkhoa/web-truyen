import type { Metadata } from "next";
import Link from "next/link";
import { FaBookOpen, FaEye, FaLayerGroup, FaPenNib } from "react-icons/fa";
import AdminDeleteStoryButton from "@/components/admin/AdminDeleteStoryButton";
import AdminStoryForm from "@/components/admin/AdminStoryForm";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Quản lý truyện - Mọt Admin",
};

export default async function AdminStoriesPage() {
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
      _count: {
        select: {
          chapters: true,
        },
      },
    },
  });

  const totalChapters = stories.reduce((total, story) => total + story._count.chapters, 0);
  const completedStories = stories.filter((story) => story.status === "Hoàn thành").length;
  const totalViews = stories.reduce((total, story) => total + story.views, 0);

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Quản lý truyện</h2>
          <p>Thêm truyện, upload ảnh bìa và quản lý từng chương cho website.</p>
        </div>
        <div className="admin-hero-actions">
          <Link href="/">Xem website</Link>
        </div>
      </section>

      <section className="admin-stat-grid admin-stat-grid-four">
        <div className="admin-stat-card">
          <span>Tổng truyện</span>
          <strong>{stories.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Tổng chương</span>
          <strong>{totalChapters}</strong>
        </div>
        <div className="admin-stat-card active">
          <span>Lượt xem</span>
          <strong>{totalViews.toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Hoàn thành</span>
          <strong>{completedStories}</strong>
        </div>
      </section>

      <AdminStoryForm />

      <section className="admin-panel admin-story-list-panel">
        <div className="admin-panel-head">
          <div>
            <p>Database</p>
            <h2>Danh sách truyện</h2>
          </div>
          <span>{stories.length} truyện</span>
        </div>

        {stories.length === 0 ? (
          <div className="admin-empty">
            <h3>Chưa có truyện nào</h3>
            <p>Hãy thêm truyện đầu tiên bằng form phía trên. Trang web public sẽ tự hiển thị khi có dữ liệu.</p>
          </div>
        ) : (
          <div className="admin-story-table">
            <div className="admin-story-table-head">
              <span>Truyện</span>
              <span>Thể loại</span>
              <span>Trạng thái</span>
              <span>Chỉ số</span>
              <span>Cập nhật</span>
              <span>Hành động</span>
            </div>

            <div className="admin-story-table-body">
              {stories.map((story) => (
                <article className="admin-story-row" key={story.id}>
                  <div className="admin-story-info">
                    <img src={story.coverImage} alt={story.title} />
                    <div>
                      <strong>{story.title}</strong>
                      <span>
                        {story.chapters[0]
                          ? `Mới nhất: chương ${story.chapters[0].number}`
                          : "Chưa có chương"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="admin-story-chip">
                      <FaLayerGroup />
                      {story.category}
                    </span>
                  </div>

                  <div>
                    <span className={`admin-status-pill ${story.status === "Hoàn thành" ? "done" : "updating"}`}>
                      {story.status}
                    </span>
                  </div>

                  <div className="admin-story-metrics">
                    <span>
                      <FaBookOpen />
                      {story._count.chapters} chương
                    </span>
                    <span>
                      <FaEye />
                      {story.views.toLocaleString("vi-VN")} lượt xem
                    </span>
                  </div>

                  <div className="admin-story-date">
                    <strong>{story.updatedAt.toLocaleDateString("vi-VN")}</strong>
                    <span>{story.slug}</span>
                  </div>

                  <div className="admin-story-actions">
                    <Link className="admin-story-action primary" href={`/admin/truyen/${story.id}/chuong`}>
                      <FaPenNib />
                      Quản lý chương
                    </Link>
                    <Link className="admin-story-action" href={`/truyen/${story.slug}`}>
                      <FaEye />
                      Xem
                    </Link>
                    <AdminDeleteStoryButton storyId={story.id} storyTitle={story.title} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
