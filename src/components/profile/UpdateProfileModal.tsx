"use client";

import { useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";

export default function UpdateProfileModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        <FaEdit /> Cập nhật
      </button>

      {isOpen && (
        <div className="reading-modal-backdrop" role="presentation">
          <section
            className="profile-update-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-update-title"
          >
            <div className="reading-modal-head">
              <div>
                <h2 id="profile-update-title">Cập nhật thông tin</h2>
                <p>Chỉnh sửa thông tin cá nhân hiển thị trong hồ sơ.</p>
              </div>

              <button
                type="button"
                className="reading-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng cập nhật hồ sơ"
              >
                <FaTimes />
              </button>
            </div>

            <form className="profile-update-form">
              <label>
                <span>Họ và tên</span>
                <input defaultValue="Nguyễn Văn A" />
              </label>

              <label>
                <span>Email</span>
                <input defaultValue="vana.nguyen@example.com" type="email" />
              </label>

              <label>
                <span>Số điện thoại</span>
                <input defaultValue="0987 *** 321" />
              </label>

              <label>
                <span>Giới tính</span>
                <select defaultValue="Nam">
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </label>

              <div className="profile-update-actions">
                <button type="button" onClick={() => setIsOpen(false)}>
                  Hủy
                </button>
                <button type="button" onClick={() => setIsOpen(false)}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
