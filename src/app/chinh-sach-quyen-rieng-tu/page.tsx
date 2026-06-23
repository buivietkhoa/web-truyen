import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getSiteSetting } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  return {
    title: `Chính sách quyền riêng tư - ${setting.siteName}`,
    robots: { index: true, follow: true },
  };
}

export default async function ChinhSachQuyenRiengTuPage() {
  const setting = await getSiteSetting();
  const siteName = setting.siteName || "Website Truyện";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 800, padding: "2rem 1rem" }}>
        <h1>Chính sách quyền riêng tư</h1>
        <p><em>Cập nhật lần cuối: tháng 6 năm 2026</em></p>

        <h2>1. Thông tin chúng tôi thu thập</h2>
        <p>
          Khi bạn đăng ký tài khoản hoặc đăng nhập qua Google/Facebook, chúng tôi thu thập:
          địa chỉ email, tên hiển thị và ảnh đại diện (nếu có). Chúng tôi cũng lưu lịch sử
          đọc truyện và danh sách truyện yêu thích của bạn.
        </p>

        <h2>2. Cách chúng tôi sử dụng thông tin</h2>
        <p>Thông tin của bạn được dùng để:</p>
        <ul>
          <li>Tạo và quản lý tài khoản</li>
          <li>Lưu lịch sử đọc truyện và danh sách yêu thích</li>
          <li>Gửi email xác minh tài khoản hoặc đặt lại mật khẩu</li>
        </ul>

        <h2>3. Chia sẻ thông tin</h2>
        <p>
          Chúng tôi không bán, trao đổi hay chuyển giao thông tin cá nhân của bạn cho bên thứ
          ba. Thông tin chỉ được chia sẻ với các dịch vụ kỹ thuật cần thiết để vận hành
          website (lưu trữ database, gửi email).
        </p>

        <h2>4. Đăng nhập qua mạng xã hội</h2>
        <p>
          Khi đăng nhập bằng Facebook hoặc Google, chúng tôi chỉ nhận email và tên của bạn.
          Chúng tôi không đăng bài, đọc tin nhắn hay thực hiện bất kỳ hành động nào trên
          tài khoản mạng xã hội của bạn.
        </p>

        <h2>5. Xóa dữ liệu</h2>
        <p>
          Bạn có thể yêu cầu xóa toàn bộ dữ liệu của mình tại trang{" "}
          <a href={`${siteUrl}/xoa-du-lieu`}>Xóa dữ liệu</a>.
        </p>

        <h2>6. Liên hệ</h2>
        <p>
          Nếu có thắc mắc về chính sách này, vui lòng liên hệ qua email của {siteName}.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
