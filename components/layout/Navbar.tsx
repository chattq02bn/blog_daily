"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Avatar, Popover } from "antd";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import {
  SearchOutlined,
  MenuOutlined,
  EditOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import NoteLogo from "./NoteLogo";
import SearchPopover from "./SearchPopover";
import SidebarDrawer from "./SidebarDrawer";
import AdminSidebarDrawer from "../admin/AdminSidebarDrawer";
import LoginModal from "./LoginModal";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useProfile } from "@/hooks/use-api";
import { clearAuth } from "@/lib/auth";
import { isAuthedAtom, openLoginModal } from "@/lib/jotai/auth";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const isAdmin = pathname.startsWith("/admin");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isAuthed = useAtomValue(isAuthedAtom);
  const { theme, toggleTheme } = useTheme();
  const { data: profile } = useProfile();

  const handleLogout = () => {
    clearAuth();
    qc.clear();
    localStorage.clear();
    setPopoverOpen(false);
    router.push("/");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Button
            type="text"
            aria-label="Menu"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            className={`lg:hidden inline-flex items-center justify-center ${styles.menuButton}`}
            style={{ fontSize: 20 }}
          />
          <NoteLogo />
        </div>
        <div className={styles.search}><SearchPopover /></div>
        <div className={styles.actions}>
          <Button
            type="text"
            aria-label="Tìm kiếm"
            icon={<SearchOutlined />}
            className={`inline-flex items-center justify-center ${styles.searchButton}`}
            style={{ fontSize: 18, color: "var(--color-text-primary)" }}
            onClick={() => setMobileSearchOpen((open) => !open)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            className={styles.create}
            style={{ fontWeight: 700, color: "var(--color-text-primary)" }}
            onClick={() => {
              if (isAuthed) {
                router.push("/admin/create");
              } else {
                openLoginModal();
              }
            }}
          >
            <span className={styles.createText}>Tạo bài viết</span>
          </Button>
          <Button
            type="text"
            aria-label={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            className={`inline-flex items-center justify-center ${styles.themeToggle}`}
            style={{ fontSize: 18, color: "var(--color-text-primary)" }}
          />
          <Popover
            trigger="click"
            placement="bottomRight"
            arrow={false}
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            content={
              <div className={styles.popover}>
                {isAuthed ? (
                  <>
                    <Link href="/admin" className={styles.popoverItem} onClick={() => setPopoverOpen(false)}>
                      Trang quản trị
                    </Link>
                    <button
                      type="button"
                      className={styles.popoverItem}
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.popoverItem}
                    onClick={() => {
                      setPopoverOpen(false);
                      openLoginModal();
                    }}
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            }
          >
            <Avatar
              size={32}
              src={profile?.avatar || undefined}
              icon={<UserOutlined />}
              className={styles.avatar}
              style={{ border: "2px solid #e5484d" }}
            />
          </Popover>
        </div>
      </div>
      {mobileSearchOpen && (
        <div className={styles.mobileSearch}><SearchPopover /></div>
      )}
      {isAdmin ? (
        <AdminSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      ) : (
        <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
      <LoginModal />
    </header>
  );
}
