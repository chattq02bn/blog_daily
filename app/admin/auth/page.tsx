"use client";

import { useState } from "react";
import { Button, Form, Input, Tabs } from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import styles from "./auth.module.scss";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  const onFinish = (values: { email: string; password: string; name?: string }) => {
    console.log(`${tab}:`, values);
  };

  const loginForm = (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Nhập email của bạn" }]}
      >
        <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[{ required: true, message: "Nhập mật khẩu của bạn" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block size="large" className="note-btn-primary">
        Đăng nhập
      </Button>
    </Form>
  );

  const registerForm = (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
      <Form.Item
        name="name"
        label="Tên hiển thị"
        rules={[{ required: true, message: "Nhập tên hiển thị của bạn" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Tên của bạn" size="large" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Nhập email của bạn" }]}
      >
        <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: "Nhập mật khẩu của bạn" },
          { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block size="large" className="note-btn-primary">
        Tạo tài khoản
      </Button>
    </Form>
  );

  return (
    <AppLayout>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Chào mừng đến với note</h1>
          <p className={styles.sub}>Đăng nhập để viết và chia sẻ những câu chuyện của bạn.</p>
          <Tabs
            activeKey={tab}
            onChange={setTab}
            centered
            items={[
              { key: "login", label: "Đăng nhập", children: loginForm },
              { key: "register", label: "Đăng ký", children: registerForm },
            ]}
          />
          <div className={styles.hint}>
            <p>Chưa có tài khoản? {tab === "login" ? "Hãy đăng ký ở tab trên." : "Hoặc đăng nhập ở tab trên."}</p>
            <p>
              Hoặc <Link href="/admin/create">tạo bài viết</Link> ngay mà không cần đăng nhập.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
