"use client";

import { useState } from "react";
import { FaClock, FaPlay, FaSave, FaToggleOff, FaToggleOn } from "react-icons/fa";

interface Props {
  storyId: string;
  unpublishedCount: number;
}

export default function ScheduleChapterPanel({ storyId, unpublishedCount }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [hourVN, setHourVN] = useState(7);
  const [intervalDays, setIntervalDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/admin/stories/${storyId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, hourVN, intervalDays, enabled }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra.");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cron/publish-chapters`, {
        headers: { "x-cron-secret": "" },
      });
      const data = await res.json();
      setMessage(`Đã publish ${data.published} chương.`);
    } catch {
      setError("Lỗi khi chạy cron.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`admin-panel schedule-panel ${enabled ? "is-enabled" : "is-disabled"}`}>
      <div className="admin-panel-head">
        <div>
          <p>Tự động</p>
          <h2>Lịch đăng chương</h2>
        </div>
        <button
          type="button"
          className={`schedule-toggle ${enabled ? "on" : "off"}`}
          onClick={() => setEnabled(!enabled)}
        >
          {enabled ? <FaToggleOn /> : <FaToggleOff />}
          {enabled ? "Đang bật" : "Đang tắt"}
        </button>
      </div>

      {message && <p className="admin-success-msg">{message}</p>}
      {error   && <p className="admin-error-msg">{error}</p>}

      <div className="schedule-info-bar">
        <FaClock />
        <span>
          {unpublishedCount > 0 ? (
            <>
              <strong>{unpublishedCount} chương bản nháp</strong> chờ đăng.
              Khi ra hết, truyện sẽ tự động chuyển sang <strong>Hoàn thành</strong>.
            </>
          ) : (
            "✅ Tất cả chương đã được công khai."
          )}
        </span>
      </div>

      {/* Chỉ hiện form khi đang bật */}
      {enabled && (
        <div className="schedule-form">
          <div className="schedule-field">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="schedule-field">
            <label>Giờ đăng (giờ VN)</label>
            <select value={hourVN} onChange={(e) => setHourVN(Number(e.target.value))} disabled={loading}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>

          <div className="schedule-field">
            <label>Tần suất</label>
            <select value={intervalDays} onChange={(e) => setIntervalDays(Number(e.target.value))} disabled={loading}>
              <option value={1}>Mỗi 1 ngày</option>
              <option value={2}>Mỗi 2 ngày</option>
              <option value={3}>Mỗi 3 ngày</option>
              <option value={7}>Mỗi 1 tuần</option>
            </select>
          </div>
        </div>
      )}

      {enabled && unpublishedCount > 0 && (
        <div className="schedule-preview">
          <p>
            📅 Chương tiếp theo sẽ đăng vào{" "}
            <strong>
              {new Date(startDate).toLocaleDateString("vi-VN")} lúc {String(hourVN).padStart(2, "0")}:00
            </strong>
            , sau đó mỗi {intervalDays} ngày 1 chương.
          </p>
          <p>⏱️ Tổng thời gian: ~{unpublishedCount * intervalDays} ngày để đăng hết {unpublishedCount} chương.</p>
        </div>
      )}

      <div className="schedule-actions">
        {enabled ? (
          <>
            <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={loading}>
              <FaSave />
              {loading ? "Đang lưu..." : "Lưu lịch đăng"}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={handleRunNow} disabled={loading} title="Publish ngay các chương đã đến giờ">
              <FaPlay />
              Chạy ngay
            </button>
          </>
        ) : (
          <button type="button" className="admin-btn-secondary" onClick={handleSave} disabled={loading}>
            <FaToggleOff />
            {loading ? "Đang lưu..." : "Tắt & xoá lịch"}
          </button>
        )}
      </div>
    </section>
  );
}
