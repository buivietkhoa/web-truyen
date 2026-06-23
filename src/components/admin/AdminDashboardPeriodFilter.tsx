"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

interface Props {
  range: string;
  from: string;
  to: string;
}

export default function AdminDashboardPeriodFilter({ range, from, to }: Props) {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState(range);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const apply = (nextRange = selectedRange, nextFrom = customFrom, nextTo = customTo) => {
    const params = new URLSearchParams({ range: nextRange });
    if (nextRange === "custom") {
      params.set("from", nextFrom);
      params.set("to", nextTo);
    }
    router.push(`/admin/dashboard?${params.toString()}`);
  };

  return (
    <div className="admin-dashboard-period-filter">
      <FaCalendarAlt />
      <select
        aria-label="Khoảng thời gian"
        value={selectedRange}
        onChange={(event) => {
          const value = event.target.value;
          setSelectedRange(value);
          if (value !== "custom") apply(value);
        }}
      >
        <option value="today">Hôm nay</option>
        <option value="7">7 ngày qua</option>
        <option value="30">30 ngày qua</option>
        <option value="90">90 ngày qua</option>
        <option value="custom">Tùy chọn ngày</option>
      </select>
      {selectedRange === "custom" && (
        <div className="admin-dashboard-custom-dates">
          <input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} />
          <span>đến</span>
          <input type="date" value={customTo} min={customFrom} onChange={(event) => setCustomTo(event.target.value)} />
          <button type="button" onClick={() => apply()}>Áp dụng</button>
        </div>
      )}
    </div>
  );
}
