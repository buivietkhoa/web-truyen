"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (!/[A-Za-zÀ-ỹ]/.test(password) || !/\d/.test(password)) {
      setError("Mật khẩu cần có cả chữ và số.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.message === "string" ? data.message : "Không thể đặt lại mật khẩu.");
        return;
      }

      setMessage("Đặt lại mật khẩu thành công. Đang chuyển về đăng nhập...");
      setTimeout(() => router.push("/dang-nhap"), 1200);
    } catch {
      setError("Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Đặt lại mật khẩu</h1>
      <p>Tạo mật khẩu mới cho tài khoản của bạn.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reset-password">Mật khẩu mới</label>
          <input
            id="reset-password"
            type="password"
            className="form-control"
            placeholder="Tối thiểu 8 ký tự, có chữ và số"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reset-confirm-password">Xác nhận mật khẩu</label>
          <input
            id="reset-confirm-password"
            type="password"
            className="form-control"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={loading}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
        </button>
      </form>

      <p className="auth-switch">
        Quay lại <Link href="/dang-nhap">đăng nhập</Link>
      </p>
    </div>
  );
}

export default function DatLaiMatKhauPage() {
  return (
    <main className="auth-page auth-page-login">
      <Suspense fallback={<div className="auth-card">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
