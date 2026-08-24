"use client";

import { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { buildSession, saveAuth } from "@/lib/auth";
import styles from "./LoginModal.module.scss";

type Mode = "login" | "forgot";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setMode("login");
    setLoading(false);
    onClose();
  };

  const onLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const session = buildSession(values.email);
    saveAuth(session);
    console.log("login success:", session);
    setLoading(false);
    handleClose();
    onLoginSuccess?.();
  };

  const onForgot = (values: { email: string }) => {
    console.log("forgot:", values);
  };

  const loginForm = (
    <Form layout="vertical" onFinish={onLogin} requiredMark={false}>
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
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        className="note-btn-primary"
      >
        Đăng nhập
      </Button>
    </Form>
  );

  const forgotForm = (
    <Form layout="vertical" onFinish={onForgot} requiredMark={false}>
      <p className={styles.description}>
        Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
      </p>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Nhập email của bạn" }]}
      >
        <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block size="large" className="note-btn-primary">
        Gửi liên kết đặt lại
      </Button>
    </Form>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
      width={480}
    >
      <div className={styles.welcome}>
        <h2 className={styles.heading}>Chào mừng đến với Note</h2>
        <p className={styles.sub}>Đăng nhập để chia sẻ câu chuyện của bạn.</p>
      </div>
      {mode === "login" ? loginForm : forgotForm}
      <div className={styles.footerLinks}>
        {mode === "login" ? (
          <button type="button" className={styles.link} onClick={() => setMode("forgot")}>
            Quên mật khẩu?
          </button>
        ) : (
          <button type="button" className={styles.link} onClick={() => setMode("login")}>
            Quay lại đăng nhập
          </button>
        )}
      </div>
    </Modal>
  );
}