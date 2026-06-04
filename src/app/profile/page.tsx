import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import {
  FaBookOpen,
  FaEdit,
  FaRegCommentDots,
  FaRegUserCircle,
  FaUser,
} from "react-icons/fa";
import ReadingHistoryModal from "@/components/profile/ReadingHistoryModal";
import UpdateProfileModal from "@/components/profile/UpdateProfileModal";

const profileStats = [
  { label: "Số truyện đã đọc", value: "142", icon: <FaBookOpen /> },
  { label: "Số bình luận", value: "28", icon: <FaRegCommentDots /> },
  { label: "Ngày tham gia", value: "15/03/2024", icon: <FaRegUserCircle /> },
];

const recentStories = [
  { title: "Thần Đạo Đan Tôn", chapter: "Chương 1245/5200", image: "https://picsum.photos/220/300?random=41", href: "/truyen/than-dao-dan-ton" },
  { title: "Đấu La Đại Lục", chapter: "Chương 327/500", image: "https://picsum.photos/220/300?random=42", href: "/truyen/de-ba" },
  { title: "Phàm Nhân Tu Tiên", chapter: "Chương 156/2400", image: "https://picsum.photos/220/300?random=43", href: "/truyen/pham-nhan-tu-tien" },
  { title: "Trạch Thiên Ký", chapter: "Chương 89/700", image: "https://picsum.photos/220/300?random=44", href: "/truyen/tuyet-the-duong-mon" },
];

export default function ProfilePage() {
  return (
    <>
      <SiteHeader activePage="profile" />

      <main className="profile-page">
        <section className="container profile-shell">
          <aside className="profile-sidebar">
            <div className="profile-user-card">
              <div className="profile-avatar">
                <img src="https://picsum.photos/120/120?random=90" alt="Nguyễn Văn A" />
                <button type="button" aria-label="Cập nhật ảnh đại diện">
                  <FaEdit />
                </button>
              </div>

              <h1>Nguyễn Văn A</h1>
              <p>Thành viên bạc</p>
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
                <UpdateProfileModal />
              </div>

              <div className="profile-info-grid">
                <label>
                  <span>Họ và tên</span>
                  <input value="Nguyễn Văn A" readOnly />
                </label>

                <label>
                  <span>Email</span>
                  <input value="vana.nguyen@example.com" readOnly />
                </label>

                <label>
                  <span>Số điện thoại</span>
                  <input value="0987 *** 321" readOnly />
                </label>

                <label>
                  <span>Giới tính</span>
                  <input value="Nam" readOnly />
                </label>
              </div>
            </section>

            <section className="profile-library">
              <div className="profile-section-head">
                <h2>Tủ truyện gần đây</h2>
                <Link href="/profile/tu-truyen">Xem tất cả →</Link>
              </div>

              <div className="profile-story-grid">
                {recentStories.map((story) => (
                  <Link href={story.href} className="profile-story-card" key={story.title}>
                    <img src={story.image} alt={story.title} />
                    <h3>{story.title}</h3>
                    <p>{story.chapter}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
