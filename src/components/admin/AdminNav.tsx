"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBook, FaCog, FaHome, FaProjectDiagram, FaRegChartBar, FaThLarge, FaUsers } from "react-icons/fa";

const groups = [
  {
    label: "Nội dung",
    links: [
      { href: "/admin/dashboard", label: "Tổng quan", icon: FaThLarge },
      { href: "/admin/truyen", label: "Quản lý truyện", icon: FaBook },
    ],
  },
  {
    label: "Affiliate",
    links: [
      { href: "/admin/affiliate", label: "Cấu hình Affiliate", icon: FaProjectDiagram },
      { href: "/admin/reports", label: "Báo cáo", icon: FaRegChartBar },
    ],
  },
  {
    label: "Hệ thống",
    links: [
      { href: "/admin/users", label: "Người dùng", icon: FaUsers },
      { href: "/admin/settings", label: "Cài đặt", icon: FaCog },
      { href: "/", label: "Về website", icon: FaHome },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Quản trị">
      {groups.map((group) => (
        <div className="admin-nav-group" key={group.label}>
          <span className="admin-nav-group-label">{group.label}</span>
          {group.links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href !== "/" && pathname.startsWith(link.href);
            return (
              <Link href={link.href} className={isActive ? "active" : ""} key={link.href}>
                <Icon />{link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
