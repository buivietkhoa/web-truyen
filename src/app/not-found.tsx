import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export default function NotFoundPage() {
  return (
    <>
      <SiteHeader />

      <main className="not-found-page">
        <section className="not-found-card">
          <span>404</span>
          <h1>Không tìm thấy trang</h1>
          <p>Trang bạn mở có thể đã bị đổi đường dẫn hoặc chưa được tạo.</p>
          <div>
            <Link href="/">Về trang chủ</Link>
            <Link href="/truyen">Xem truyện mới</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
