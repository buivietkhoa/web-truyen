"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function DangKiPage() {
  const router = useRouter();

  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!hoTen.trim() || !email.trim() || !matKhau.trim() || !xacNhanMatKhau.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (matKhau.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (matKhau !== xacNhanMatKhau) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: hoTen.trim(),
          email: email.trim(),
          password: matKhau,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng ký thất bại.");
        return;
      }

      router.push("/dang-nhap");
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-register">
      <div className="auth-card auth-card-register">
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản để theo dõi truyện yêu thích.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Họ tên</label>
            <input
              id="register-name"
              type="text"
              className="form-control"
              placeholder="Nhập họ tên"
              value={hoTen}
              onChange={(event) => setHoTen(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Mật khẩu</label>
            <input
              id="register-password"
              type="password"
              className="form-control"
              placeholder="Tối thiểu 6 ký tự"
              value={matKhau}
              onChange={(event) => setMatKhau(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
            <input
              id="register-confirm-password"
              type="password"
              className="form-control"
              placeholder="Nhập lại mật khẩu"
              value={xacNhanMatKhau}
              onChange={(event) => setXacNhanMatKhau(event.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}
