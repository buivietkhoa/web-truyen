import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaGlobeAsia,
  FaLayerGroup,
  FaPlus,
} from "react-icons/fa";
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
    title: story ? `Quản lý chương - ${story.title}` : "Quản lý chương - Một Admin",
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
  const publicChapters = story.chapters.filter((chapter) => chapter.published).length;

  return (
    <div className="admin-page admin-chapters-page">
      <section className="admin-hero">
        <div>
          <span className="admin-chapters-eyebrow">Nội dung truyện</span>
          <h2>Quản lý chương</h2>
          <p>
            {story.title} / {story.chapters.length} chương hiện có
          </p>
        </div>
        <div className="admin-hero-actions">
          <Link href="/admin/truyen"><FaArrowLeft /> Quay lại truyện</Link>
          <Link href={`/truyen/${story.slug}`}><FaExternalLinkAlt /> Xem ngoài website</Link>
        </div>
      </section>

      <section className="admin-stat-grid admin-stat-grid-four admin-chapter-stats">
        <div className="admin-stat-card story">
          <div className="admin-chapter-stat-icon"><FaBookOpen /></div>
          <div><span>Tên truyện</span><strong>{story.title}</strong></div>
        </div>
        <div className="admin-stat-card public">
          <div className="admin-chapter-stat-icon"><FaGlobeAsia /></div>
          <div><span>Công khai</span><strong>{publicChapters}</strong></div>
        </div>
        <div className="admin-stat-card chapters">
          <div className="admin-chapter-stat-icon"><FaLayerGroup /></div>
          <div><span>Số chương</span><strong>{story.chapters.length}</strong></div>
        </div>
        <div className="admin-stat-card status">
          <div className="admin-chapter-stat-icon"><FaCheckCircle /></div>
          <div><span>Trạng thái truyện</span><strong>{story.status}</strong></div>
        </div>
      </section>

      <section className="admin-panel admin-chapter-list-panel">
        <div className="admin-panel-head">
          <div>
            <p>Danh sách</p>
            <h2>Chương đã đăng</h2>
          </div>
          <span>{story.chapters.length} chương</span>
        </div>

        {story.chapters.length === 0 ? (
          <div className="admin-empty admin-chapter-empty">
            <span><FaBookOpen /></span>
            <h3>Chưa có chương nào</h3>
            <p>Hãy thêm chương đầu tiên bằng form phía dưới.</p>
            <a href="#them-chuong"><FaPlus /> Tạo chương đầu tiên</a>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Chương</th>
                  <th>Tiêu đề</th>
                  <th>Hiển thị</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {story.chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    <td><span className="admin-chapter-number">{chapter.number}</span></td>
                    <td>
                      <strong>{chapter.title}</strong>
                      <span>Chương {chapter.number} của {story.title}</span>
                    </td>
                    <td>
                      <span className={`admin-status-pill ${chapter.published ? "published" : "draft"}`}>
                        {chapter.published ? "Công khai" : "Bản nháp"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-chapter-date">
                        <strong>{chapter.createdAt.toLocaleDateString("vi-VN")}</strong>
                        <span>{chapter.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-chapter-date">
                        <strong>{chapter.updatedAt.toLocaleDateString("vi-VN")}</strong>
                        <span>{chapter.updatedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-chapter-actions">
                        <AdminEditChapterModal
                          chapter={{
                            id: chapter.id,
                            storyId: story.id,
                            number: chapter.number,
                            title: chapter.title,
                            content: chapter.content,
                            published: chapter.published,
                          }}
                        />
                        <Link className="admin-chapter-action read" href={`/doc-truyen/${story.slug}/${chapter.id}`}>
                          <FaBookOpen /> Đọc
                        </Link>
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

      <section id="them-chuong" className="admin-panel admin-chapter-form-panel">
        <div className="admin-panel-head">
          <div>
            <p>Thêm mới</p>
            <h2>Đăng chương tiếp theo</h2>
          </div>
          <span>Chương {nextChapterNumber}</span>
        </div>
        <AdminChapterForm
          key={nextChapterNumber}
          storyId={story.id}
          nextChapterNumber={nextChapterNumber}
          storyPublished={story.published}
        />
      </section>
    </div>
  );
}
