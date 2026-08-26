"use client";

import { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useAtomValue } from "jotai";
import { saveApiSession } from "@/lib/auth";
import { authApi } from "@/lib/api";
import {
  closeLoginModal,
  loginModalAtom,
  loginModalNoticeAtom,
} from "@/lib/jotai/auth";
import styles from "./LoginModal.module.scss";

type Mode = "login" | "register" | "forgot";

export default function LoginModal() {
  const open = useAtomValue(loginModalAtom);
  const notice = useAtomValue(loginModalNoticeAtom);
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleClose = () => {
    setMode("login");
    setLoading(false);
    closeLoginModal();
  };

  const onLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const session = await authApi.login(values);
      saveApiSession(session);
      messageApi.success("Đăng nhập thành công!");
      handleClose();
    } catch (error) {
      setLoading(false);
      const data = (error as { response?: { data?: { message?: string } } }).response?.data;
      messageApi.error(data?.message ?? "Email hoặc mật khẩu không đúng");
    }
  };

  const onRegister = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await authApi.register(values);
      // Đăng ký xong tự đăng nhập luôn
      const session = await authApi.login({ email: values.email, password: values.password });
      saveApiSession(session);
      messageApi.success("Tạo tài khoản thành công!");
      handleClose();
    } catch (error) {
      setLoading(false);
      const data = (error as { response?: { data?: { message?: string } } }).response?.data;
      messageApi.error(data?.message ?? "Không thể tạo tài khoản. Thử lại nhé!");
    }
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

  const registerForm = (
    <Form layout="vertical" onFinish={onRegister} requiredMark={false}>
      <Form.Item
        name="name"
        label="Tên"
        rules={[{ required: true, message: "Nhập tên của bạn" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
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
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        className="note-btn-primary"
      >
        Tạo tài khoản
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
      {contextHolder}
      <div className={styles.welcome}>
        <h2 className={styles.heading}>Chào mừng đến với Note</h2>
        <p className={styles.sub}>Đăng nhập để chia sẻ câu chuyện của bạn.</p>
      </div>
      {notice && <p className={styles.description}>{notice}</p>}
      {mode === "login" ? loginForm : mode === "register" ? registerForm : forgotForm}
      <div className={styles.footerLinks}>
        {mode === "login" && (
          <>
            <button type="button" className={styles.link} onClick={() => setMode("register")}>
              Chưa có tài khoản? Đăng ký
            </button>
            <button type="button" className={styles.link} onClick={() => setMode("forgot")}>
              Quên mật khẩu?
            </button>
          </>
        )}
        {mode === "register" && (
          <button type="button" className={styles.link} onClick={() => setMode("login")}>
            Đã có tài khoản? Đăng nhập
          </button>
        )}
        {mode === "forgot" && (
          <button type="button" className={styles.link} onClick={() => setMode("login")}>
            Quay lại đăng nhập
          </button>
        )}
      </div>
    </Modal>
  );
}
