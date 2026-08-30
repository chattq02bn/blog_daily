"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Modal, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { saveApiSession } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import {
  closeLoginModal,
  loginModalAtom,
  loginModalNoticeAtom,
} from "@/lib/jotai/auth";
import styles from "./LoginModal.module.scss";

type Mode = "login" | "forgot";

export default function LoginModal() {
  const router = useRouter();
  const qc = useQueryClient();
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
      await qc.invalidateQueries({ queryKey: qk.profile() });
      messageApi.success("Đăng nhập thành công!");
      handleClose();
      router.push("/admin/create");
    } catch (error) {
      setLoading(false);
      const data = (error as { response?: { data?: { message?: string } } }).response?.data;
      messageApi.error(data?.message ?? "Email hoặc mật khẩu không đúng");
    }
  };

  const onForgot = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      messageApi.success("Mật khẩu mới đã được gửi đến email của bạn.");
      setMode("login");
    } catch (error) {
      const data = (error as { response?: { data?: { message?: string } } }).response?.data;
      messageApi.error(data?.message ?? "Không thể gửi yêu cầu. Thử lại sau!");
    } finally {
      setLoading(false);
    }
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
        Nhập email của bạn, chúng tôi sẽ gửi mật khẩu mới qua email.
      </p>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Nhập email của bạn" }]}
      >
        <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block size="large" loading={loading} className="note-btn-primary">
        Gửi mật khẩu mới
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
      {mode === "login" ? loginForm : forgotForm}
      <div className={styles.footerLinks}>
        {mode === "login" && (
          <button type="button" className={styles.link} onClick={() => setMode("forgot")}>
            Quên mật khẩu?
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
