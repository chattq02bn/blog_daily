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
import {
  getMonthlyVisits,
  peakDay,
  sumVisits,
  type DayVisit,
} from "@/data/dashboard";
import {
  loadProfile,
  saveProfile,
  defaultProfile,
  type AdminProfile,
} from "@/lib/profileStorage";
import styles from "./admin.module.scss";

/** Chỉ cho chọn tháng trong năm 2026 */
function disabledMonth(current: Dayjs): boolean {
  return current.isBefore("2026-01-01") || current.isAfter("2026-12-31");
}

const formatNumber = (n: number) => n.toLocaleString("vi-VN");

export default function AdminPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs("2026-08-01"));
  const [profile, setProfile] = useState<AdminProfile>(defaultProfile);
  const [form] = Form.useForm<{
    name: string;
    email: string;
    role: string;
    logoName: string;
    description?: string;
  }>();

  useEffect(() => {
    const loaded = loadProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được ở client sau khi mount
    setProfile(loaded);
    form.setFieldsValue({
      name: loaded.name,
      email: loaded.email,
      role: loaded.role,
      logoName: loaded.logoName,
      description: loaded.description,
    });
  }, [form]);

  const data: DayVisit[] = useMemo(
    () => getMonthlyVisits(month.month()),
    [month]
  );
  const total = useMemo(() => sumVisits(data), [data]);
  const peak = useMemo<DayVisit>(() => peakDay(data), [data]);
  const avg = Math.round(total / (data.length || 1));

  const handleAvatarChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error("Ảnh tối đa 2MB");
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...profile, avatar: String(reader.result) };
      setProfile(next);
      saveProfile(next);
      message.success("Đã cập nhật avatar");
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
    const next: AdminProfile = {
      ...profile,
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role.trim() || profile.role,
      logoName: values.logoName.trim() || "note",
      description: values.description?.trim(),
    };
    setProfile(next);
    saveProfile(next);
    message.success("Đã lưu thông tin cá nhân");
  };

  return (
    <AdminLayout>
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
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Ngày cao nhất"
                value={formatNumber(peak.visits)}
                suffix={`(ngày ${peak.day})`}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Trung bình mỗi ngày"
                value={formatNumber(avg)}
                suffix="lượt"
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
              <div className={styles.profileLeft}>
                <Avatar src={profile.avatar} icon={<UserOutlined />} size={96} />
                <div className={styles.profileName}>{profile.name}</div>
                <div className={styles.profileRole}>{profile.role}</div>
                {profile.description && (
                  <p className={styles.profileDesc}>{profile.description}</p>
                )}
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => handleAvatarChange(file)}
                >
                  <Button icon={<UploadOutlined />}>Đổi avatar</Button>
                </Upload>
              </div>
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
