"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBook, FaCog, FaHome, FaProjectDiagram, FaRegChartBar, FaThLarge, FaUsers } from "react-icons/fa";

const links = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: FaThLarge },
  { href: "/admin/truyen", label: "Quản lý truyện", icon: FaBook },
  { href: "/admin/affiliate", label: "Cấu hình Affiliate", icon: FaProjectDiagram },
  { href: "/admin/users", label: "Người dùng", icon: FaUsers },
  { href: "/admin/reports", label: "Báo cáo", icon: FaRegChartBar },
  { href: "/admin/settings", label: "Cài đặt", icon: FaCog },
  { href: "/", label: "Về website", icon: FaHome },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Quản trị">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.href !== "/" && pathname.startsWith(link.href);

        return (
          <Link href={link.href} className={isActive ? "active" : ""} key={link.href}>
            <Icon />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
