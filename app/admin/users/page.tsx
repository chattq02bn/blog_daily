"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import styles from "./users.module.scss";

type Role = "admin" | "user";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const seedUsers: UserItem[] = [
  { id: "u1", name: "Admin", email: "admin@note.com", role: "admin" },
  { id: "u2", name: "Lan", email: "lan@example.com", role: "user" },
  { id: "u3", name: "Minh", email: "minh@example.com", role: "user" },
  { id: "u4", name: "Hương", email: "huong@example.com", role: "user" },
  { id: "u5", name: "Đức", email: "duc@example.com", role: "user" },
  { id: "u6", name: "Trang", email: "trang@example.com", role: "admin" },
  { id: "u7", name: "Nam", email: "nam@example.com", role: "user" },
];

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>(seedUsers);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form] = Form.useForm<{ name: string; email: string; role: Role }>();

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchKw =
        !kw ||
        u.name.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw) ||
        u.id.toLowerCase().includes(kw);
      return matchRole && matchKw;
    });
  }, [users, keyword, roleFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user: UserItem) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editing.id
              ? {
                  ...u,
                  name: values.name,
                  email: values.email,
                  role: editing.role === "admin" ? "admin" : values.role,
                }
              : u
          )
        );
        console.log("update user:", { ...editing, ...values });
      } else {
        const newUser: UserItem = {
          id: `u_${Date.now().toString(36)}`,
          name: values.name,
          email: values.email,
          role: values.role,
        };
        setUsers((prev) => [newUser, ...prev]);
        console.log("create user:", newUser);
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (user: UserItem) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    console.log("delete user:", user);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string) => <span className={styles.userId}>{id}</span>,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className={styles.userName}>{name}</span>,
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
      width: 110,
      render: (role: Role) => (
        <Tag color={role === "admin" ? "red" : "default"} className={styles.roleTag}>
          {role === "admin" ? "Admin" : "User"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_: unknown, record: UserItem) => (
        <div className={styles.actions}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              aria-label={`Sửa ${record.name}`}
            />
          </Tooltip>
          {record.role === "admin" ? (
            <Tooltip title="Không thể xóa Admin">
              <Button type="text" danger disabled icon={<DeleteOutlined />} aria-label="Xóa" />
            </Tooltip>
          ) : (
            <Popconfirm
              title="Xóa người dùng"
              description={`Bạn có chắc muốn xóa "${record.name}"?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${record.name}`} />
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
            form.setFieldsValue({ name: editing.name, email: editing.email, role: editing.role });
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
    </AdminLayout>
  );
}