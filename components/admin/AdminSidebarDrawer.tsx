"use client";

import { Drawer } from "antd";
import NoteLogo from "../layout/NoteLogo";
import AdminSidebar from "./AdminSidebar";

export default function AdminSidebarDrawer({
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
      <AdminSidebar variant="drawer" onNavigate={onClose} />
    </Drawer>
  );
}
