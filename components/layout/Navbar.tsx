"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input, Button, Avatar, Popover } from "antd";
import { SearchOutlined, MenuOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import NoteLogo from "./NoteLogo";
import SidebarDrawer from "./SidebarDrawer";
import AdminSidebarDrawer from "../admin/AdminSidebarDrawer";
import LoginModal from "./LoginModal";
import { clearAuth, hasAuth } from "@/lib/auth";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(() => hasAuth());

  const handleLogout = () => {
    clearAuth();
    setIsAuthed(false);
    setPopoverOpen(false);
    router.push("/");
  };

  const searchInput = (
    <Input
      prefix={
        <SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />
      }
      placeholder="Tìm kiếm theo từ khóa hoặc tên người dùng"
      variant="filled"
      allowClear
      style={{
        borderRadius: 9999,
        width: "100%",
        height: 36,
        backgroundColor: "var(--color-background-secondary)",
      }}
    />
  );

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
        <div className={styles.search}>{searchInput}</div>
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
              if (hasAuth()) {
                router.push("/admin/create");
              } else {
                setLoginOpen(true);
              }
            }}
          >
            <span className={styles.createText}>Tạo bài viết</span>
          </Button>
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
                      setLoginOpen(true);
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
              icon={<UserOutlined />}
              className={styles.avatar}
            />
          </Popover>
        </div>
      </div>
      {mobileSearchOpen && (
        <div className={styles.mobileSearch}>{searchInput}</div>
      )}
      {isAdmin ? (
        <AdminSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      ) : (
        <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={() => setIsAuthed(true)} />
    </header>
  );
}
