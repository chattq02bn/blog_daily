"use client";

import { Drawer } from "antd";
import NoteLogo from "./NoteLogo";
import Sidebar from "./Sidebar";

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
      <Sidebar variant="drawer" onNavigate={onClose} />
    </Drawer>
  );
}
