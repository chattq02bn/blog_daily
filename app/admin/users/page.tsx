"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useCreateUser,
  useDeleteUser,
  useResendMail,
  useToggleUserStatus,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-api";
import type { ApiUser, ApiUserRole } from "@/lib/api";
import styles from "./users.module.scss";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

export default function AdminUsersPage() {
  const { message } = App.useApp();
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<ApiUserRole | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [mailErrorUser, setMailErrorUser] = useState<ApiUser | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [form] = Form.useForm<{ name: string; email: string; role: ApiUserRole }>();

  const usersQuery = useUsers({ limit: 100 });
  const users: ApiUser[] = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();
  const resendMailMutation = useResendMail();

  /* Lọc hiển thị làm client-side cho mượt (dữ liệu đã tải sẵn) */
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchKw =
        !kw ||
        (u.name ?? "").toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw) ||
        u.id.toLowerCase().includes(kw);
      return matchRole && matchKw;
    });
  }, [users, keyword, roleFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user: ApiUser) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editing) {
        updateMutation.mutate(
          {
            id: editing.id,
            body: {
              name: values.name,
              email: values.email,
              role: editing.role === "admin" ? "ADMIN" : (values.role.toUpperCase() as "USER" | "ADMIN"),
            },
          },
          {
            onSuccess: () => message.success("Đã cập nhật người dùng"),
            onError: () => message.error("Cập nhật thất bại"),
          }
        );
      } else {
        const tempPassword = `Note${Math.random().toString(36).slice(2, 10)}!1`;
        createMutation.mutate(
          {
            name: values.name,
            email: values.email,
            password: tempPassword,
            role: values.role.toUpperCase() as "USER" | "ADMIN",
          },
          {
            onSuccess: (data) => {
              if (data.mailStatus === "sent") {
                message.success("Đã thêm người dùng và gửi mail thành công");
              } else {
                message.warning("Đã thêm người dùng nhưng gửi mail thất bại");
              }
            },
            onError: () => message.error("Thêm người dùng thất bại (email có thể đã tồn tại)"),
          }
        );
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (user: ApiUser) => {
    deleteMutation.mutate(user.id, {
      onSuccess: () => message.success(`Đã vô hiệu hóa "${user.name ?? user.email}"`),
      onError: () => message.error("Vô hiệu hóa thất bại"),
    });
  };

  const handleToggleStatus = (user: ApiUser) => {
    toggleStatusMutation.mutate(user.id, {
      onSuccess: () => {
        const newStatus = user.status === "active" ? "inactive" : "active";
        message.success(`Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} "${user.name ?? user.email}"`);
      },
      onError: () => message.error("Thay đổi trạng thái thất bại"),
    });
  };

  const handleResendMail = (user: ApiUser) => {
    setResendingId(user.id);
    resendMailMutation.mutate(user.id, {
      onSuccess: (result) => {
        if (result.success) {
          message.success(`Đã gửi lại mail đến ${result.email}`);
          setMailErrorUser(null);
        } else {
          message.error(result.error || "Gửi mail thất bại");
        }
      },
      onError: () => message.error("Gửi mail thất bại"),
      onSettled: () => setResendingId(null),
    });
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name: string | null) => <span className={styles.userName}>{name ?? "—"}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: ApiUserRole) => (
        <Tag color={role === "admin" ? "red" : "default"} className={styles.roleTag}>
          {role === "admin" ? "Admin" : "User"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string, record: ApiUser) => (
        <Switch
          checked={status === "active"}
          size="small"
          disabled={record.role === "admin"}
          loading={toggleStatusMutation.isPending}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Mail",
      dataIndex: "mailStatus",
      key: "mailStatus",
      width: 120,
      render: (mailStatus: string, record: ApiUser) => {
        if (mailStatus === "sent") {
          return <Tag color="success">Đã gửi</Tag>;
        }
        if (mailStatus === "failed") {
          return (
            <Tooltip title="Xem lỗi">
              <Tag
                color="error"
                className={styles.mailErrorTag}
                onClick={() => setMailErrorUser(record)}
              >
                Lỗi <InfoCircleOutlined />
              </Tag>
            </Tooltip>
          );
        }
        return <Tag color="processing">Đang gửi</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_: unknown, record: ApiUser) => (
        <div className={styles.actions}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              aria-label={`Sửa ${record.name ?? record.email}`}
            />
          </Tooltip>
          <Tooltip title="Gửi lại mail">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => handleResendMail(record)}
              loading={resendingId === record.id}
              aria-label="Gửi lại mail"
            />
          </Tooltip>
          {record.role === "admin" ? (
            <Tooltip title="Không thể vô hiệu hóa Admin">
              <Button type="text" danger disabled icon={<DeleteOutlined />} aria-label="Xóa" />
            </Tooltip>
          ) : (
            <Popconfirm
              title="Vô hiệu hóa người dùng"
              description={`Bạn có chắc muốn vô hiệu hóa "${record.name ?? record.email}"?`}
              okText="Vô hiệu hóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} aria-label="Xóa" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Quản lý người dùng</h1>
          <div className={styles.headerActions}>
            <Input
              prefix={<SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />}
              placeholder="Lọc theo tên, email"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={styles.search}
            />
            <Select
              placeholder="Lọc theo role"
              allowClear
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              className={styles.roleSelect}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="note-btn-primary"
              onClick={openCreate}
            >
              Thêm người dùng
            </Button>
          </div>
        </div>
        <Table
          scroll={{ x: "max-content", y: "calc(100dvh - 330px)" }}
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </div>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Lưu thay đổi" : "Thêm người dùng"}
        cancelText="Hủy"
        title={editing ? "Sửa người dùng" : "Thêm người dùng mới"}
        destroyOnHidden
        afterOpenChange={(open) => {
          if (!open) return;
          if (editing) {
            form.setFieldsValue({
              name: editing.name ?? "",
              email: editing.email,
              role: editing.role,
            });
          } else {
            form.resetFields();
            form.setFieldsValue({ role: "user" });
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Nhập tên người dùng" }]}
          >
            <Input placeholder="VD: Lan" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Chọn role" }]}
          >
            <Select
              options={roleOptions}
              disabled={editing?.role === "admin"}
            />
          </Form.Item>
          {editing?.role === "admin" && (
            <p className={styles.hint}>Role của tài khoản Admin không thể thay đổi.</p>
          )}
        </Form>
      </Modal>
      <Modal
        open={!!mailErrorUser}
        onCancel={() => setMailErrorUser(null)}
        footer={null}
        title="Chi tiết lỗi gửi mail"
      >
        <div style={{ marginBottom: 12 }}>
          <strong>Email:</strong> {mailErrorUser?.email}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Lỗi:</strong>{" "}
          <span style={{ color: "#ef4444" }}>{mailErrorUser?.mailError || "Không có thông tin lỗi"}</span>
        </div>
        <Button
          type="primary"
          icon={<MailOutlined />}
          loading={resendingId === mailErrorUser?.id}
          onClick={() => {
            if (mailErrorUser) handleResendMail(mailErrorUser);
          }}
          className="note-btn-primary"
        >
          Gửi lại mail
        </Button>
      </Modal>
    </AdminLayout>
  );
}
