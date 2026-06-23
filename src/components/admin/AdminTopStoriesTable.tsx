"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaChevronLeft, FaChevronRight, FaEye, FaExternalLinkAlt, FaTimes } from "react-icons/fa";

interface TopStory {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  views: number;
  chapters: number;
  updatedAt: string;
}

interface Props {
  stories: TopStory[];
  totalViews: number;
  generatedAt: string;
  title?: string;
}

type SortKey = "views" | "chapters" | "updatedAt";
type TimeRange = "all" | "7" | "30" | "90";

const PAGE_SIZE = 5;

export default function AdminTopStoriesTable({
  stories,
  totalViews,
  generatedAt,
  title = "Top truyện lượt xem",
}: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("views");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [page, setPage] = useState(1);
  const [selectedStory, setSelectedStory] = useState<{ story: TopStory; rank: number } | null>(null);

  useEffect(() => {
    if (!selectedStory) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setSelectedStory(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedStory]);

  const filteredStories = useMemo(() => {
    const cutoff = timeRange === "all" ? null : new Date(generatedAt).getTime() - Number(timeRange) * 24 * 60 * 60 * 1000;
    return stories
      .filter((story) => cutoff === null || new Date(story.updatedAt).getTime() >= cutoff)
      .sort((first, second) => {
        if (sortBy === "updatedAt") return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
        return second[sortBy] - first[sortBy];
      });
  }, [generatedAt, sortBy, stories, timeRange]);

  const pageCount = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleStories = filteredStories.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeRange = (value: TimeRange) => {
    setTimeRange(value);
    setPage(1);
  };

  const changeSort = (value: SortKey) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <section className="admin-panel admin-report-ranking-panel">
      <div className="admin-panel-head admin-ranking-head">
        <div><p>Xếp hạng</p><h2>{title}</h2></div>
        <div className="admin-report-ranking-total"><FaEye /><span>{totalViews.toLocaleString("vi-VN")}</span><small>lượt xem</small></div>
      </div>

      <div className="admin-ranking-toolbar">
        <label>
          Cập nhật trong
          <select value={timeRange} onChange={(event) => changeRange(event.target.value as TimeRange)}>
            <option value="all">Tất cả thời gian</option>
            <option value="7">7 ngày</option>
            <option value="30">30 ngày</option>
            <option value="90">90 ngày</option>
          </select>
        </label>
        <label>
          Sắp xếp
          <select value={sortBy} onChange={(event) => changeSort(event.target.value as SortKey)}>
            <option value="views">Lượt xem</option>
            <option value="chapters">Số chương</option>
            <option value="updatedAt">Ngày cập nhật</option>
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-report-ranking-table">
          <thead><tr><th>#</th><th>Truyện</th><th>Thể loại</th><th>Chương</th><th>Lượt xem</th><th>Cập nhật</th><th /></tr></thead>
          <tbody>
            {visibleStories.map((story, index) => {
              const rank = (safePage - 1) * PAGE_SIZE + index + 1;
              return (
                <tr
                  key={story.id}
                  className="admin-ranking-row"
                  tabIndex={0}
                  onClick={() => setSelectedStory({ story, rank })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedStory({ story, rank });
                    }
                  }}
                >
                  <td><span className={`admin-rank-badge ${rank <= 3 ? `top${rank}` : ""}`}>{rank}</span></td>
                  <td className="admin-report-story-cell"><strong>{story.title}</strong><span className={`admin-status-pill ${story.status === "Hoàn thành" ? "done" : "updating"}`}>{story.status}</span></td>
                  <td><span className="admin-report-category-pill">{story.category}</span></td>
                  <td><span className="admin-report-metric chapter"><FaBookOpen /> {story.chapters}</span></td>
                  <td><span className="admin-report-metric views"><FaEye /> {story.views.toLocaleString("vi-VN")}</span></td>
                  <td><time dateTime={story.updatedAt}>{new Date(story.updatedAt).toLocaleDateString("vi-VN")}</time></td>
                  <td><button type="button" className="admin-ranking-detail" aria-label={`Xem chi tiết ${story.title}`} onClick={(event) => { event.stopPropagation(); setSelectedStory({ story, rank }); }}><FaExternalLinkAlt /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleStories.length === 0 && <div className="admin-ranking-empty">Không có truyện cập nhật trong khoảng thời gian này.</div>}
      </div>

      <div className="admin-ranking-pagination">
        <span>{filteredStories.length} truyện</span>
        <div>
          <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Trang trước"><FaChevronLeft /></button>
          <strong>{safePage} / {pageCount}</strong>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Trang sau"><FaChevronRight /></button>
        </div>
      </div>

      {selectedStory && (
        <div className="admin-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedStory(null)}>
          <section className="admin-modal admin-ranking-modal" role="dialog" aria-modal="true" aria-labelledby="ranking-story-title">
            <header className="admin-modal-head">
              <div><p>Chi tiết xếp hạng</p><h3 id="ranking-story-title">{selectedStory.story.title}</h3></div>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedStory(null)} aria-label="Đóng"><FaTimes /></button>
            </header>
            <div className="admin-ranking-modal-body">
              <div className="admin-ranking-modal-rank">
                <span className={`admin-rank-badge ${selectedStory.rank <= 3 ? `top${selectedStory.rank}` : ""}`}>{selectedStory.rank}</span>
                <div><small>Vị trí hiện tại</small><strong>Hạng {selectedStory.rank}</strong></div>
              </div>
              <dl className="admin-ranking-modal-stats">
                <div><dt>Thể loại</dt><dd>{selectedStory.story.category}</dd></div>
                <div><dt>Trạng thái</dt><dd>{selectedStory.story.status}</dd></div>
                <div><dt>Số chương</dt><dd><FaBookOpen /> {selectedStory.story.chapters}</dd></div>
                <div><dt>Lượt xem</dt><dd><FaEye /> {selectedStory.story.views.toLocaleString("vi-VN")}</dd></div>
                <div className="wide"><dt>Cập nhật gần nhất</dt><dd>{new Date(selectedStory.story.updatedAt).toLocaleString("vi-VN")}</dd></div>
              </dl>
            </div>
            <footer className="admin-ranking-modal-footer">
              <button type="button" className="admin-modal-cancel" onClick={() => setSelectedStory(null)}>Đóng</button>
              <Link href={`/truyen/${selectedStory.story.slug}`} onClick={() => setSelectedStory(null)}><FaExternalLinkAlt /> Xem trang truyện</Link>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
