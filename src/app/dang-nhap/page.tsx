"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

export default function DangNhapPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");

  const loginWithProvider = (provider: "Google" | "Facebook") => {
    const user = {
      hoTen: `Người dùng ${provider}`,
      email: `${provider.toLowerCase()}@motcham.demo`,
      provider,
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLogin", "true");
    router.push("/");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !matKhau.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setError("Tài khoản chưa tồn tại. Vui lòng đăng ký trước.");
      return;
    }

    const user = JSON.parse(savedUser);

    if (user.email !== email || user.matKhau !== matKhau) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }

    localStorage.setItem("isLogin", "true");
    router.push("/");
  };

  return (
    <main className="auth-page auth-page-login">
      <div className="auth-card">
        <h1>Đăng nhập</h1>
        <p>Chào mừng bạn quay lại Mọt Chạm.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Đăng nhập
          </button>
        </form>

        <div className="auth-divider-simple">
          <span />
          <p>hoặc đăng nhập với</p>
          <span />
        </div>

        <div className="auth-social-buttons">
          <button type="button" onClick={() => loginWithProvider("Google")}>
            <FaGoogle />
            Google
          </button>
          <button type="button" onClick={() => loginWithProvider("Facebook")}>
            <FaFacebookF />
            Facebook
          </button>
        </div>

        <p className="auth-switch">
          Chưa có tài khoản? <Link href="/dang-ki">Đăng ký ngay</Link>
        </p>
      </div>
    </main>
  );
}
