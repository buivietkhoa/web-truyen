"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaChartLine } from "react-icons/fa";

interface ChartPoint {
  label: string;
  tooltipLabel?: string;
  date: string;
  count: number;
}

interface AdminViewsChartProps {
  data: ChartPoint[];
  fixedRange?: boolean;
  fixedTitle?: string;
}

type ChartRange = 7 | 30 | 90 | "custom";

const WIDTH = 1000;
const HEIGHT = 116;
const LEFT = 52;
const RIGHT = 18;
const TOP = 10;
const BOTTOM = 22;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

export default function AdminViewsChart({ data, fixedRange = false, fixedTitle }: AdminViewsChartProps) {
  const [range, setRange] = useState<ChartRange>(30);
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [customStart, setCustomStart] = useState(data.at(-30)?.date ?? data[0]?.date ?? "");
  const [customEnd, setCustomEnd] = useState(data.at(-1)?.date ?? "");
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const sourceData = useMemo(() => data.map((item) => ({ ...item, count: liveCounts[item.date] ?? item.count })), [data, liveCounts]);

  useEffect(() => {
    const from = data[0]?.date;
    const to = data.at(-1)?.date;
    if (!from || !to) return;

    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/api/admin/analytics/views?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { updatedAt: string; data: Array<{ date: string; count: number }> };
        if (cancelled) return;
        setLiveCounts(Object.fromEntries(payload.data.map((item) => [item.date, item.count])));
        setLastUpdated(new Date(payload.updatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // Keep the last successful chart state when the network is temporarily unavailable.
      }
    };

    const initialRefresh = window.setTimeout(refresh, 1_000);
    const interval = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [data]);

  const visibleData = useMemo(() => {
    if (fixedRange) return sourceData;
    if (range !== "custom") return sourceData.slice(-range);
    return sourceData.filter((item) => item.date >= customStart && item.date <= customEnd);
  }, [customEnd, customStart, fixedRange, range, sourceData]);

  const comparisonData = useMemo(() => {
    if (!showComparison || visibleData.length === 0) return [];
    const startIndex = sourceData.findIndex((item) => item.date === visibleData[0].date);
    const previous = sourceData.slice(Math.max(0, startIndex - visibleData.length), startIndex);
    const missing = Math.max(0, visibleData.length - previous.length);
    return [
      ...Array.from({ length: missing }, () => ({ label: "", date: "", count: 0 })),
      ...previous,
    ];
  }, [showComparison, sourceData, visibleData]);

  const maxValue = Math.max(
    ...visibleData.map((item) => item.count),
    ...comparisonData.map((item) => item.count),
    1,
  );
  const total = visibleData.reduce((sum, item) => sum + item.count, 0);
  const getX = (index: number) => visibleData.length <= 1
    ? LEFT + PLOT_WIDTH / 2
    : LEFT + (index / (visibleData.length - 1)) * PLOT_WIDTH;
  const getY = (count: number) => TOP + PLOT_HEIGHT - (count / maxValue) * PLOT_HEIGHT;
  const currentPoints = visibleData.map((item, index) => `${getX(index)},${getY(item.count)}`).join(" ");
  const previousPoints = comparisonData.map((item, index) => `${getX(index)},${getY(item.count)}`).join(" ");
  const axisLabelCount = Math.min(6, visibleData.length);
  const axisIndexes = new Set(
    Array.from({ length: axisLabelCount }, (_, index) => (
      Math.round((index * (visibleData.length - 1)) / Math.max(1, axisLabelCount - 1))
    )),
  );
  const hoveredPoint = hoveredIndex === null ? null : visibleData[hoveredIndex];
  const hoveredPrevious = hoveredIndex === null ? null : comparisonData[hoveredIndex];
  const title = fixedTitle || (range === "custom" ? "Lượt xem theo khoảng tùy chọn" : `Lượt xem ${range} ngày qua`);

  return (
    <section className="admin-panel admin-report-chart-panel">
      <div className="admin-panel-head admin-report-chart-head">
        <div><p>Biểu đồ</p><h2>{title}</h2></div>
        <div className="admin-report-chart-actions">
          <div className="admin-report-chart-legend">
            <span className="admin-chart-live" title={lastUpdated ? `Cập nhật lúc ${lastUpdated}` : "Đang kết nối dữ liệu"}><i /> Trực tiếp{lastUpdated && <small>{lastUpdated}</small>}</span>
            <span><i className="current" /> Hiện tại</span>
            {showComparison && <span><i className="previous" /> Kỳ trước</span>}
            <strong><FaChartLine /> {total.toLocaleString("vi-VN")} lượt xem</strong>
          </div>
          {!fixedRange && <div className="admin-report-range" aria-label="Chọn khoảng thời gian">
            {[7, 30, 90].map((days) => (
              <button type="button" className={range === days ? "active" : ""} onClick={() => setRange(days as 7 | 30 | 90)} key={days}>
                {days} ngày
              </button>
            ))}
            <button type="button" className={range === "custom" ? "active" : ""} onClick={() => setRange("custom")}>
              <FaCalendarAlt /> Tùy chọn
            </button>
          </div>}
          {!fixedRange && <button type="button" className={`admin-report-compare ${showComparison ? "active" : ""}`} onClick={() => setShowComparison((value) => !value)}>
            So sánh kỳ trước
          </button>}
        </div>
      </div>

      {!fixedRange && range === "custom" && (
        <div className="admin-report-custom-range">
          <label>Từ ngày<input type="date" min={data[0]?.date} max={customEnd} value={customStart} onChange={(event) => setCustomStart(event.target.value)} /></label>
          <label>Đến ngày<input type="date" min={customStart} max={data.at(-1)?.date} value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /></label>
        </div>
      )}

      <div className="admin-report-line-chart" onMouseLeave={() => setHoveredIndex(null)}>
        {visibleData.length > 0 ? (
          <>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={title}>
              <defs>
                <linearGradient id="reportChartArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3, 4].map((step) => {
                const y = TOP + (step / 4) * PLOT_HEIGHT;
                const value = Math.round(maxValue - (step / 4) * maxValue);
                return (
                  <g key={step}>
                    <line x1={LEFT} y1={y} x2={WIDTH - RIGHT} y2={y} className="admin-report-grid-line" />
                    <text x={LEFT - 9} y={y + 3} textAnchor="end" className="admin-report-axis-value">{value}</text>
                  </g>
                );
              })}

              <polygon points={`${LEFT},${TOP + PLOT_HEIGHT} ${currentPoints} ${WIDTH - RIGHT},${TOP + PLOT_HEIGHT}`} fill="url(#reportChartArea)" />
              {showComparison && comparisonData.length > 0 && <polyline points={previousPoints} className="admin-report-line previous" />}
              <polyline points={currentPoints} className="admin-report-line current" />

              {visibleData.map((item, index) => {
                const x = getX(index);
                const y = getY(item.count);
                return (
                  <g key={item.date} onMouseEnter={() => setHoveredIndex(index)}>
                    <circle cx={x} cy={y} r="11" fill="transparent" />
                    {(item.count > 0 || hoveredIndex === index) && (
                      <circle cx={x} cy={y} r={hoveredIndex === index ? 4.5 : 3} className="admin-report-point" />
                    )}
                    {axisIndexes.has(index) && <text x={x} y={HEIGHT - 8} textAnchor="middle" className="admin-report-axis-date">{item.label}</text>}
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && hoveredIndex !== null && (
              <div
                className={`admin-report-tooltip ${getX(hoveredIndex) > WIDTH * 0.82 ? "align-right" : ""}`}
                style={{ left: `${(getX(hoveredIndex) / WIDTH) * 100}%`, top: `${(getY(hoveredPoint.count) / HEIGHT) * 100}%` }}
              >
                <strong>{hoveredPoint.tooltipLabel || hoveredPoint.label} - {hoveredPoint.count} lượt xem</strong>
                {showComparison && hoveredPrevious && <span>Kỳ trước: {hoveredPrevious.count} lượt xem</span>}
              </div>
            )}
          </>
        ) : (
          <div className="admin-report-chart-empty">Không có dữ liệu trong khoảng ngày đã chọn.</div>
        )}
      </div>
    </section>
  );
}
