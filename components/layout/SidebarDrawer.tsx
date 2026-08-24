"use client";

import { Drawer } from "antd";
import Link from "next/link";
import {
  HomeOutlined,
  FireOutlined,
  BookOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import NoteLogo from "./NoteLogo";

export default function SidebarDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="left"
      size={280}
      title={<NoteLogo />}
      styles={{ body: { padding: "8px 16px 32px" } }}
    >
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="note-sidebar-nav-link is-active"
          onClick={onClose}
        >
          <HomeOutlined />
          <span>Trang chủ</span>
        </Link>
        <Link href="/trend" className="note-sidebar-nav-link" onClick={onClose}>
          <FireOutlined />
          <span>Xu hướng</span>
        </Link>
        <Link
          href="/magazines"
          className="note-sidebar-nav-link"
          onClick={onClose}
        >
          <BookOutlined />
          <span>Tạp chí</span>
        </Link>
        <Link
          href="/mypage"
          className="note-sidebar-nav-link"
          onClick={onClose}
        >
          <UserOutlined />
          <span>Trang cá nhân</span>
        </Link>
        <Link href="/admin/create" className="note-sidebar-nav-link" onClick={onClose}>
          <EditOutlined />
          <span>Tạo bài viết</span>
        </Link>
      </nav>
    </Drawer>
  );
}
