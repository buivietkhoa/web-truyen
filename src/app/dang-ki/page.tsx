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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    const user = {
      hoTen,
      email,
      matKhau,
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLogin", "true");

    router.push("/");
  };

  return (
    <main className="auth-page auth-page-register">
      <div className="auth-card auth-card-register">
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản để theo dõi truyện yêu thích.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập họ tên"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Tối thiểu 6 ký tự"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập lại mật khẩu"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Đăng ký
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}
