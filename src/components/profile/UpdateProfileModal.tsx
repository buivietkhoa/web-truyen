"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTimes } from "react-icons/fa";

interface UpdateProfileModalProps {
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export default function UpdateProfileModal({ name, email, phone, gender }: UpdateProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formName, setFormName] = useState(name);
  const [formPhone, setFormPhone] = useState(phone || "");
  const [formGender, setFormGender] = useState(gender || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");
    setFormName(name);
    setFormPhone(phone || "");
    setFormGender(gender || "");
    setIsOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!formName.trim()) {
      setError("Họ tên không được để trống.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          gender: formGender,
        }),
      });

      if (response.status === 401) {
        router.push("/dang-nhap");
        router.refresh();
        return;
      }

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể cập nhật hồ sơ."));
        return;
      }

      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Không thể kết nối đến server. Vui lòng kiểm tra dev server và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        <FaEdit /> Cập nhật
      </button>

      {isOpen && (
        <div className="reading-modal-backdrop" role="presentation">
          <section className="profile-update-modal" role="dialog" aria-modal="true" aria-labelledby="profile-update-title">
            <div className="reading-modal-head">
              <div>
                <h2 id="profile-update-title">Cập nhật thông tin</h2>
                <p>Chỉnh sửa thông tin cá nhân hiển thị trong hồ sơ.</p>
              </div>

              <button
                type="button"
                className="reading-modal-close"
                onClick={handleClose}
                aria-label="Đóng cập nhật hồ sơ"
              >
                <FaTimes />
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form className="profile-update-form" onSubmit={handleSubmit}>
              <label>
                <span>Họ và tên</span>
                <input
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  disabled={loading}
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input value={email} type="email" readOnly />
              </label>

              <label>
                <span>Số điện thoại</span>
                <input
                  value={formPhone}
                  onChange={(event) => setFormPhone(event.target.value)}
                  placeholder="Nhập số điện thoại"
                  disabled={loading}
                />
              </label>

              <label>
                <span>Giới tính</span>
                <select
                  value={formGender}
                  onChange={(event) => setFormGender(event.target.value)}
                  disabled={loading}
                >
                  <option value="">Chọn giới tính</option>
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </label>

              <div className="profile-update-actions">
                <button type="button" onClick={handleClose} disabled={loading}>
                  Hủy
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
