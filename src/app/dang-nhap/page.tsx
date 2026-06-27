"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export default function DangNhapPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const errorCode = query.get("error");
    const oauthErrors: Record<string, string> = {
      google_config: "Google Login chưa được cấu hình. Vui lòng thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET.",
      google_state: "Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.",
      google_token: "Không thể lấy token từ Google. Kiểm tra Client ID, Client Secret và Callback URL.",
      google_profile: "Không thể lấy thông tin tài khoản Google.",
      google_email: "Tài khoản Google chưa cấp quyền email.",
      google: "Đăng nhập Google thất bại. Vui lòng thử lại.",
      facebook_config: "Facebook Login chưa được cấu hình. Vui lòng thêm FACEBOOK_CLIENT_ID và FACEBOOK_CLIENT_SECRET.",
      facebook_state: "Phiên đăng nhập Facebook không hợp lệ. Vui lòng thử lại.",
      facebook_token: "Không thể lấy token từ Facebook. Kiểm tra App ID, App Secret và Callback URL.",
      facebook_profile: "Không thể lấy thông tin tài khoản Facebook.",
      facebook_email: "Tài khoản Facebook chưa cấp quyền email.",
      facebook: "Đăng nhập Facebook thất bại. Vui lòng thử lại.",
      verification_invalid: "Liên kết xác minh email không hợp lệ hoặc đã hết hạn.",
    };

    const timer = window.setTimeout(() => {
      if (errorCode && oauthErrors[errorCode]) {
        setError(oauthErrors[errorCode]);
        window.history.replaceState(null, "", "/dang-nhap");
      } else if (query.get("verified") === "1") {
        setSuccess("Email đã được xác minh. Bạn có thể đăng nhập.");
        window.history.replaceState(null, "", "/dang-nhap");
      } else if (query.get("registered") === "1") {
        setSuccess("Đăng ký thành công. Hãy kiểm tra email để kích hoạt tài khoản.");
        window.history.replaceState(null, "", "/dang-nhap");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const loginWithProvider = (provider: "google" | "facebook") => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setNeedsVerification(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !matKhau.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email không hợp lệ.");
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
          email: normalizedEmail,
          password: matKhau,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(typeof data?.message === "string" ? data.message : "Đăng nhập thất bại.");
        setNeedsVerification(data?.code === "EMAIL_NOT_VERIFIED");
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch {
      setError("Không thể kết nối đến server. Vui lòng kiểm tra dev server và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Hãy nhập email cần xác minh.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const message = await readErrorMessage(response, "Không thể gửi lại email xác minh.");
      if (!response.ok) {
        setError(message);
        return;
      }
      setError("");
      setSuccess(message);
      setNeedsVerification(false);
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
        {success && <div className="alert alert-success">{success}</div>}
        {needsVerification && (
          <button
            type="button"
            className="btn btn-outline-primary btn-block auth-resend-verification"
            onClick={resendVerification}
            disabled={loading}
          >
            Gửi lại email xác minh
          </button>
        )}

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
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={matKhau}
                onChange={(event) => setMatKhau(event.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                disabled={loading}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="auth-forgot-row">
            <Link href="/quen-mat-khau">Quên mật khẩu?</Link>
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

        <div className="auth-social-buttons auth-social-single">
          <button type="button" onClick={() => loginWithProvider("google")} disabled={loading}>
            <FaGoogle />
            Đăng nhập với Google
          </button>
        </div>

        <p className="auth-switch">
          Chưa có tài khoản? <Link href="/dang-ki">Đăng ký ngay</Link>
        </p>
      </div>
    </main>
  );
}
