"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  return {
    message: typeof data.message === "string" ? data.message : "",
    resetUrl: typeof data.resetUrl === "string" ? data.resetUrl : "",
  };
}

export default function QuenMatKhauPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setResetUrl("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "Không thể tạo yêu cầu đặt lại mật khẩu.");
        return;
      }

      setMessage(data.message);
      setResetUrl(data.resetUrl);
    } catch {
      setError("Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-login">
      <div className="auth-card">
        <h1>Quên mật khẩu</h1>
        <p>Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {resetUrl && (
          <div className="auth-dev-reset-link">
            <span>Link test dev:</span>
            <Link href={resetUrl}>Mở trang đặt lại mật khẩu</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              className="form-control"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
          </button>
        </form>

        <p className="auth-switch">
          Nhớ mật khẩu? <Link href="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}
