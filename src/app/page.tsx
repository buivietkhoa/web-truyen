import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { FaBookOpen, FaStar } from "react-icons/fa";
import { danhSachTruyen } from "@/data/truyen";

const latestStories = danhSachTruyen.slice(0, 8);
const recommended = [
  danhSachTruyen.find((truyen) => truyen.id === "tuyet-the-duong-mon"),
  danhSachTruyen.find((truyen) => truyen.id === "vu-luyen-dien-phong"),
  danhSachTruyen.find((truyen) => truyen.id === "than-dao-dan-ton"),
].filter(Boolean);

export default function HomePage() {
  return (
    <>
      <SiteHeader activePage="home" />

      <main className="home-page">
        <section className="container hero-section">
          <div className="row">
            <div className="col-lg-8">
              <HeroSlider />
            </div>

            <div className="col-lg-4">
              <h3 className="side-title"><FaStar /> Đề cử cho bạn</h3>

              {recommended.map((item) => (
                <Link href={`/truyen/${item!.id}`} className="recommend-card" key={item!.id}>
                  <img src={item!.anhBia} alt={item!.ten} />
                  <div>
                    <h4>{item!.ten}</h4>
                    <p>{item!.theLoai} · {item!.trangThai}</p>
                    <span>★ 4.9</span>
                  </div>
                </Link>
              ))}

              <Link href="/truyen" className="small-link">Xem thêm đề cử</Link>
            </div>
          </div>
        </section>

        <section className="container mt-5 home-main-section">
          <div className="section-heading">
            <div>
              <h2>Truyện Mới Cập Nhật</h2>
              <p>Khám phá những chương truyện mới nhất vừa lên kệ.</p>
            </div>
            <Link href="/truyen">Tất cả</Link>
          </div>

          <div className="row latest-grid">
            {latestStories.map((story) => (
              <div className="col-lg-3 col-sm-6 mb-4" key={story.id}>
                <Link href={`/truyen/${story.id}`} className="story-card">
                  <div className="story-cover-wrap image-skeleton">
                    <img src={story.anhBia} alt={story.ten} loading="lazy" />
                    <span>{story.theLoai}</span>
                  </div>
                  <h3>{story.ten}</h3>
                  <p>{story.tacGia}</p>
                  <strong>Chương {story.chuongs.at(-1)?.soChuong || 1}</strong>
                </Link>
              </div>
            ))}
          </div>

          <div className="completed-box completed-wide-box">
            <h2>Tuyệt Phẩm Hoàn Thành</h2>
            <p>Những bộ truyện đã kết thúc, sẵn sàng cho những buổi đọc liền mạch.</p>

            <div className="row">
              {danhSachTruyen
                .filter((truyen) => truyen.trangThai === "Hoàn thành")
                .slice(0, 4)
                .map((truyen) => (
                  <div className="col-lg-3 col-md-6 mb-3" key={truyen.id}>
                    <Link href={`/truyen/${truyen.id}`} className="completed-item">
                      <FaBookOpen />
                      <div>
                        <h4>{truyen.ten}</h4>
                        <p>Full · {truyen.luotXem.toLocaleString("vi-VN")} lượt đọc</p>
                      </div>
                      <span>9.8</span>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
