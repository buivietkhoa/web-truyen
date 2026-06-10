import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminChapterForm from "@/components/admin/AdminChapterForm";
import AdminDeleteChapterButton from "@/components/admin/AdminDeleteChapterButton";
import AdminEditChapterModal from "@/components/admin/AdminEditChapterModal";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    storyId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storyId } = await params;
  const story = await db.story.findUnique({
    where: {
      id: storyId,
    },
    select: {
      title: true,
    },
  });

  return {
    title: story ? `Quản lý chương - ${story.title}` : "Quản lý chương - Mọt Admin",
  };
}

export default async function AdminStoryChaptersPage({ params }: Props) {
  const { storyId } = await params;
  const story = await db.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      chapters: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  if (!story) {
    notFound();
  }

  const latestChapter = story.chapters.at(-1);
  const nextChapterNumber = (latestChapter?.number || 0) + 1;

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Quản lý chương</h2>
          <p>
            {story.title} / {story.chapters.length} chương hiện có
          </p>
        </div>
        <div className="admin-hero-actions">
          <Link href="/admin/truyen">Quay lại truyện</Link>
          <Link href={`/truyen/${story.slug}`}>Xem ngoài website</Link>
        </div>
      </section>

      <section className="admin-stat-grid admin-stat-grid-four">
        <div className="admin-stat-card">
          <span>Tên truyện</span>
          <strong>{story.title}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Thể loại</span>
          <strong>{story.category}</strong>
        </div>
        <div className="admin-stat-card active">
          <span>Số chương</span>
          <strong>{story.chapters.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Trạng thái</span>
          <strong>{story.status}</strong>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Danh sách</p>
            <h2>Chương đã đăng</h2>
          </div>
          <span>{story.chapters.length} chương</span>
        </div>

        {story.chapters.length === 0 ? (
          <div className="admin-empty">
            <h3>Chưa có chương nào</h3>
            <p>Hãy thêm chương đầu tiên bằng form phía dưới.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Chương</th>
                  <th>Tiêu đề</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {story.chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    <td>{chapter.number}</td>
                    <td>
                      <strong>{chapter.title}</strong>
                      <span>{chapter.id}</span>
                    </td>
                    <td>{chapter.createdAt.toLocaleDateString("vi-VN")}</td>
                    <td>{chapter.updatedAt.toLocaleDateString("vi-VN")}</td>
                    <td>
                      <div className="admin-chapter-actions">
                        <AdminEditChapterModal chapter={{
                          id: chapter.id,
                          storyId: story.id,
                          number: chapter.number,
                          title: chapter.title,
                          content: chapter.content,
                        }} />
                        <Link className="admin-chapter-action read" href={`/doc-truyen/${story.slug}/${chapter.id}`}>Đọc</Link>
                        <AdminDeleteChapterButton storyId={story.id} chapterId={chapter.id} chapterNumber={chapter.number} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Thêm mới</p>
            <h2>Đăng chương tiếp theo</h2>
          </div>
          <span>Chương {nextChapterNumber}</span>
        </div>
        <AdminChapterForm storyId={story.id} nextChapterNumber={nextChapterNumber} />
      </section>
    </div>
  );
}
