"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppstoreOutlined,
  FileTextOutlined,
  TagsOutlined,
  TeamOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import styles from "./AdminSidebar.module.scss";

const menuItems = [
  { href: "/admin", label: "Tổng quan", icon: <HomeOutlined /> },
  { href: "/admin/sidebar", label: "Quản lý Sidebar", icon: <AppstoreOutlined /> },
  { href: "/admin/posts", label: "Quản lý bài viết", icon: <FileTextOutlined /> },
  { href: "/admin/tags", label: "Quản lý tag", icon: <TagsOutlined /> },
  { href: "/admin/users", label: "Quản lý người dùng", icon: <TeamOutlined /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[11.375rem] shrink-0 flex-col overflow-y-auto border-r border-border-default pr-4 lg:flex">
      <div className="flex flex-col gap-1 border-b border-border-default pb-4">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}