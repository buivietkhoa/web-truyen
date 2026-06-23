import Link from "next/link";
import { FaBook, FaBookOpen, FaSearch, FaUsers } from "react-icons/fa";
import { db } from "@/lib/db";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);

  const [stories, chapters, users] = query.length >= 2
    ? await Promise.all([
        db.story.findMany({
          where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] },
          take: 8,
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, slug: true, category: true },
        }),
        db.chapter.findMany({
          where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { story: { title: { contains: query, mode: "insensitive" } } }] },
          take: 8,
          orderBy: { updatedAt: "desc" },
          select: { id: true, number: true, title: true, story: { select: { slug: true, title: true } } },
        }),
        db.user.findMany({
          where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] },
          take: 8,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, role: true, active: true },
        }),
      ])
    : [[], [], []];

  const total = stories.length + chapters.length + users.length;

  return (
    <div className="admin-global-search-page">
      <div className="admin-hero">
        <div><h2>Tìm kiếm hệ thống</h2><p>Kết quả truyện, chương và người dùng trong một nơi.</p></div>
      </div>

      <form className="admin-global-search-form">
        <FaSearch /><input name="q" defaultValue={query} placeholder="Nhập ít nhất 2 ký tự..." autoFocus /><button type="submit">Tìm kiếm</button>
      </form>

      {query.length < 2 ? (
        <div className="admin-search-empty">Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm.</div>
      ) : total === 0 ? (
        <div className="admin-search-empty">Không tìm thấy kết quả phù hợp với “{query}”.</div>
      ) : (
        <div className="admin-search-results">
          <section className="admin-panel">
            <div className="admin-panel-head"><div><p>Nội dung</p><h2>Truyện ({stories.length})</h2></div><FaBook /></div>
            {stories.map((story) => <Link href={`/truyen/${story.slug}`} key={story.id}><strong>{story.title}</strong><span>{story.category} · {story.slug}</span></Link>)}
          </section>
          <section className="admin-panel">
            <div className="admin-panel-head"><div><p>Nội dung</p><h2>Chương ({chapters.length})</h2></div><FaBookOpen /></div>
            {chapters.map((chapter) => <Link href={`/doc-truyen/${chapter.story.slug}/${chapter.id}`} key={chapter.id}><strong>Chương {chapter.number}: {chapter.title}</strong><span>{chapter.story.title}</span></Link>)}
          </section>
          <section className="admin-panel">
            <div className="admin-panel-head"><div><p>Hệ thống</p><h2>Người dùng ({users.length})</h2></div><FaUsers /></div>
            {users.map((user) => <Link href="/admin/users" key={user.id}><strong>{user.name}</strong><span>{user.email} · {user.role} · {user.active ? "Hoạt động" : "Đã khóa"}</span></Link>)}
          </section>
        </div>
      )}
    </div>
  );
}
