import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getSiteSetting } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  return {
    title: `Xóa dữ liệu - ${setting.siteName}`,
    robots: { index: true, follow: true },
  };
}

export default async function XoaDuLieuPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 800, padding: "2rem 1rem" }}>
        <h1>Yêu cầu xóa dữ liệu</h1>
        <p>
          Nếu bạn muốn xóa toàn bộ dữ liệu cá nhân khỏi hệ thống của chúng tôi, hãy thực hiện theo
          các bước sau:
        </p>

        <h2>Cách 1: Xóa tài khoản trong hồ sơ</h2>
        <ol>
          <li>Đăng nhập vào tài khoản của bạn</li>
          <li>
            Vào trang <strong>Hồ sơ</strong>
          </li>
          <li>
            Chọn <strong>Xóa tài khoản</strong>
          </li>
          <li>Xác nhận yêu cầu</li>
        </ol>
        <p>
          Sau khi xóa, toàn bộ thông tin cá nhân, lịch sử đọc và danh sách yêu thích của bạn sẽ bị
          xóa vĩnh viễn khỏi hệ thống.
        </p>

        <h2>Cách 2: Yêu cầu thủ công</h2>
        <p>
          Nếu bạn không thể đăng nhập, hãy gửi email với tiêu đề{" "}
          <strong>&quot;Yêu cầu xóa dữ liệu&quot;</strong> kèm địa chỉ email đã đăng ký. Chúng tôi
          sẽ xử lý trong vòng 7 ngày làm việc.
        </p>

        <h2>Phạm vi dữ liệu sẽ bị xóa</h2>
        <ul>
          <li>Thông tin tài khoản: email, tên, ảnh đại diện</li>
          <li>Lịch sử đọc truyện</li>
          <li>Danh sách truyện yêu thích</li>
          <li>Toàn bộ liên kết với tài khoản Facebook hoặc Google</li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
