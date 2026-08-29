"use client";

import { useEffect, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Skeleton,
  Upload,
} from "antd";
import { SaveOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProfile, useUpdateProfile } from "@/hooks/use-api";
import styles from "../admin.module.scss";

export default function AdminSettingsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<{
    name: string;
    email: string;
    role: string;
    logoName: string;
    description?: string;
  }>();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  /* Nạp hồ sơ vào form */
  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setAvatar(profile.avatar ?? undefined);
    form.setFieldsValue({
      name: profile.name ?? "",
      email: profile.email,
      role: profile.role === "admin" ? "Admin" : "User",
      logoName: profile.logoName ?? "note",
      description: profile.description ?? "",
    });
  }, [profileQuery.data, form]);

  const handleAvatarChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error("Ảnh tối đa 2MB");
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setAvatar(base64);
      updateProfileMutation.mutate(
        { avatar: base64 },
        {
          onSuccess: () => message.success("Đã cập nhật avatar"),
          onError: () => message.error("Cập nhật avatar thất bại"),
        }
      );
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSaveInfo = (values: {
    name: string;
    email: string;
    role: string;
    logoName: string;
    description?: string;
  }) => {
    updateProfileMutation.mutate(
      {
        name: values.name.trim(),
        logoName: values.logoName.trim() || "note",
        description: values.description?.trim() || null,
      },
      {
        onSuccess: () => message.success("Đã lưu thông tin cá nhân"),
        onError: () => message.error("Lưu thông tin thất bại"),
      }
    );
  };

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div>
          <h1 className={styles.heading}>Cài đặt</h1>
          <p className={styles.sub}>Quản lý thông tin cá nhân</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="Hồ sơ" className={styles.card}>
              {profileQuery.isPending ? (
                <Skeleton avatar active paragraph={{ rows: 2 }} />
              ) : (
                <div className={styles.profileLeft}>
                  <Avatar src={avatar} icon={<UserOutlined />} size={96} />
                  <div className={styles.profileName}>
                    {profileQuery.data?.name ?? "—"}
                  </div>
                  <div className={styles.profileRole}>
                    {profileQuery.data?.role === "admin" ? "Admin" : "User"}
                  </div>
                  {profileQuery.data?.description && (
                    <p className={styles.profileDesc}>{profileQuery.data.description}</p>
                  )}
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => handleAvatarChange(file)}
                  >
                    <Button icon={<UploadOutlined />}>Đổi avatar</Button>
                  </Upload>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="Thông tin cá nhân" className={styles.card}>
              <Form form={form} layout="vertical" onFinish={handleSaveInfo}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Tên hiển thị"
                      rules={[{ required: true, message: "Nhập tên hiển thị" }]}
                    >
                      <Input placeholder="VD: Người quản trị" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Email">
                      <Input type="email" placeholder="admin@note.com" disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="role" label="Vai trò (chỉ đọc)">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="logoName"
                      label="Tên logo"
                      rules={[{ required: true, message: "Nhập tên logo" }]}
                    >
                      <Input placeholder="VD: note" maxLength={16} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea
                    rows={3}
                    placeholder="Giới thiệu ngắn về bạn..."
                    maxLength={300}
                    showCount
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updateProfileMutation.isPending}
                  className="note-btn-primary"
                >
                  Lưu thay đổi
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
