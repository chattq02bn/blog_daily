"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Skeleton,
  Statistic,
  Upload,
} from "antd";
import { SaveOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProfile, useUpdateProfile, useVisits } from "@/hooks/use-api";
import styles from "./admin.module.scss";

interface DayVisit {
  day: number;
  visits: number;
}

/** Chỉ cho chọn tháng trong năm 2026 */
function disabledMonth(current: Dayjs): boolean {
  return current.isBefore("2026-01-01") || current.isAfter("2026-12-31");
}

const formatNumber = (n: number) => n.toLocaleString("vi-VN");

export default function AdminPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs("2026-08-01"));
  const [form] = Form.useForm<{
    name: string;
    email: string;
    role: string;
    logoName: string;
    description?: string;
  }>();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [messageApi, contextHolder] = message.useMessage();

  const monthKey = month.format("YYYY-MM");
  const visitsQuery = useVisits(monthKey);
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  /* Dữ liệu biểu đồ */
  const data: DayVisit[] = useMemo(
    () => (visitsQuery.data?.days ?? []).map((d) => ({ day: d.day, visits: d.visits })),
    [visitsQuery.data]
  );
  const total = useMemo(() => data.reduce((sum, d) => sum + d.visits, 0), [data]);
  const peak = useMemo<DayVisit>(
    () => data.reduce((max, d) => (d && d.visits > (max?.visits ?? -1) ? d : max), data[0] ?? { day: 1, visits: 0 }),
    [data]
  );
  const avg = Math.round(total / (data.length || 1));

  /* Nạp hồ sơ vào form */
  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ avatar từ dữ liệu server
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
      messageApi.error("Ảnh tối đa 2MB");
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setAvatar(base64);
      updateProfileMutation.mutate(
        { avatar: base64 },
        {
          onSuccess: () => messageApi.success("Đã cập nhật avatar"),
          onError: () => messageApi.error("Cập nhật avatar thất bại"),
        }
      );
    };
    reader.readAsDataURL(file);
    return false; // chặn upload tự động của antd
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
        onSuccess: () => messageApi.success("Đã lưu thông tin cá nhân"),
        onError: () => messageApi.error("Lưu thông tin thất bại"),
      }
    );
  };

  return (
    <AdminLayout>
      {contextHolder}
      <div className={styles.wrap}>
        {/* ===== Thống kê truy cập ===== */}
        <Card className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.heading}>Tổng quan</h1>
              <p className={styles.sub}>Thống kê lượt truy cập hàng tháng</p>
            </div>
            <DatePicker
              picker="month"
              value={month}
              onChange={(value) => value && setMonth(value)}
              disabledDate={disabledMonth}
              allowClear={false}
              className={styles.monthFilter}
            />
          </div>

          <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Tổng truy cập"
                value={formatNumber(total)}
                suffix="lượt"
                loading={visitsQuery.isPending}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Ngày cao nhất"
                value={formatNumber(peak.visits)}
                suffix={`(ngày ${peak.day})`}
                loading={visitsQuery.isPending}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Trung bình mỗi ngày"
                value={formatNumber(avg)}
                suffix="lượt"
                loading={visitsQuery.isPending}
              />
            </Col>
          </Row>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#08131a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#08131a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#08131a14" />
                <XAxis dataKey="day" tickLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  tickLine={false}
                  fontSize={12}
                  width={44}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString("vi-VN")} lượt`,
                    "Truy cập",
                  ]}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#08131a"
                  strokeWidth={2}
                  fill="url(#visitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ===== Thông tin cá nhân ===== */}
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
                      <Input type="email" placeholder="admin@note.com" />
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
