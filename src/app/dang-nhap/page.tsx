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
  const [loading, setLoading] = useState(false);

  const loginWithProvider = (provider: "Google" | "Facebook") => {
    setError(`Đăng nhập bằng ${provider} cần cấu hình OAuth ở bước sau.`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !matKhau.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: matKhau,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng nhập thất bại.");
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-login">
      <div className="auth-card">
        <h1>Đăng nhập</h1>
        <p>Chào mừng bạn quay lại Mọt Chạm.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(event) => setMatKhau(event.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
