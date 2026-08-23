"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Button, Avatar, Popover } from "antd";
import { SearchOutlined, MenuOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import NoteLogo from "./NoteLogo";
import SidebarDrawer from "./SidebarDrawer";
import LoginModal from "./LoginModal";
import { clearAuth, hasAuth } from "@/lib/auth";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(() => hasAuth());

  const handleLogout = () => {
    clearAuth();
    setIsAuthed(false);
    setPopoverOpen(false);
    router.push("/");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Button
          type="text"
          aria-label="Menu"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center justify-center"
          style={{ fontSize: 20 }}
        />
        <NoteLogo />
        <div className={styles.search}>
          <Input
            prefix={
              <SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />
            }
            placeholder="Tìm kiếm theo từ khóa hoặc tên người dùng"
            variant="filled"
            allowClear
            style={{
              borderRadius: 9999,
              maxWidth: 420,
              width: "100%",
              height: 36,
              backgroundColor: "var(--color-background-secondary)",
            }}
          />
        </div>
        <div className={styles.actions}>
          <Link href="/admin/create">
            <Button
              type="text"
              icon={<EditOutlined />}
              className={styles.create}
              style={{ fontWeight: 700, color: "var(--color-text-primary)" }}
            >
              Tạo bài viết
            </Button>
          </Link>
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
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={() => setIsAuthed(true)} />
    </header>
  );
}
