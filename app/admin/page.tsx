"use client";

import { useEffect, useState } from "react";
import { Avatar, Card, Descriptions } from "antd";
import { UserOutlined } from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import { getStoredUser, type AuthSession } from "@/lib/auth";
import styles from "./admin.module.scss";

export default function AdminPage() {
  const [user, setUser] = useState<AuthSession["user"] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được ở client sau khi mount
    setUser(getStoredUser());
  }, []);

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <h1 className={styles.heading}>Trang quản trị</h1>
              <p className={styles.sub}>Chào mừng {user?.name || "..."} đến với trang quản trị.</p>
            </div>
          </div>
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Tên hiển thị">{user?.name || "-"}</Descriptions.Item>
            <Descriptions.Item label="Email">{user?.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="ID">{user?.id || "-"}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </AdminLayout>
  );
}