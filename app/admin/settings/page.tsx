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
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  LockOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  FacebookOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useProfile,
  useUpdateProfile,
  useSocialLinks,
  useUpdateSocialLinks,
} from "@/hooks/use-api";
import { profileApi, type SocialPlatform } from "@/lib/api";
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
  const [passwordForm] = Form.useForm();
  const [socialForm] = Form.useForm();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const socialLinksQuery = useSocialLinks();
  const updateSocialLinksMutation = useUpdateSocialLinks();

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

  /* Nạp social links vào form */
  useEffect(() => {
    const links = socialLinksQuery.data;
    if (!links) return;
    const values: Record<string, string> = {};
    for (const link of links) {
      values[link.platform] = link.url;
    }
    socialForm.setFieldsValue(values);
  }, [socialLinksQuery.data, socialForm]);

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

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setChangingPassword(true);
    try {
      await profileApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công");
      passwordForm.resetFields();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveSocialLinks = (values: Record<string, string>) => {
    if (updateSocialLinksMutation.isPending) return;
    const platforms: SocialPlatform[] = ["youtube", "instagram", "tiktok", "facebook", "x"];
    const links = platforms.map((p) => ({
      platform: p,
      url: values[p]?.trim() || "",
    }));
    updateSocialLinksMutation.mutate(links, {
      onSuccess: () => message.success("Đã cập nhật mạng xã hội"),
      onError: () => message.error("Cập nhật mạng xã hội thất bại"),
    });
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

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="Đổi mật khẩu" className={styles.card}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: "Nhập mật khẩu mới" },
                    { min: 8, message: "Tối thiểu 8 ký tự" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Xác nhận mật khẩu mới" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockOutlined />}
                  loading={changingPassword}
                  className="note-btn-primary"
                >
                  Đổi mật khẩu
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Mạng xã hội"
              className={styles.card}
              extra={<span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>Hiển thị ở Sidebar</span>}
            >
              {socialLinksQuery.isPending ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <Form
                  form={socialForm}
                  layout="vertical"
                  onFinish={handleSaveSocialLinks}
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="youtube" label={<span><YoutubeOutlined /> YouTube</span>}>
                        <Input placeholder="https://youtube.com/@..." prefix={<LinkOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="instagram" label={<span><InstagramOutlined /> Instagram</span>}>
                        <Input placeholder="https://instagram.com/..." prefix={<LinkOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="tiktok" label={<span>🎵 TikTok</span>}>
                        <Input placeholder="https://tiktok.com/@..." prefix={<LinkOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="facebook" label={<span><FacebookOutlined /> Facebook</span>}>
                        <Input placeholder="https://facebook.com/..." prefix={<LinkOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="x" label={<span>𝕏 X (Twitter)</span>}>
                        <Input placeholder="https://x.com/..." prefix={<LinkOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updateSocialLinksMutation.isPending}
                    className="note-btn-primary"
                  >
                    Cập nhật
                  </Button>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
