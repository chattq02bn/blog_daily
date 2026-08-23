"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  deleteTopic,
  loadSidebarItems,
  loadTopics,
  saveSidebarItems,
  saveTopic,
} from "@/lib/adminStorage";
import { type AdminTopic } from "@/data/admin";
import styles from "./topic.module.scss";

function TopicCreatePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [topics, setTopics] = useState<AdminTopic[]>(() => loadTopics());
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTopic | null>(null);
  const [form] = Form.useForm<{ name: string; description?: string }>();

  const itemName = searchParams.get("name") ?? "";

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return topics;
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.description.toLowerCase().includes(kw)
    );
  }, [topics, keyword]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (topic: AdminTopic) => {
    setEditing(topic);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const data = {
        name: values.name.trim(),
        description: values.description?.trim() ?? "",
      };
      if (editing) {
        const updated: AdminTopic = { ...editing, ...data };
        saveTopic(updated);
        setTopics((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
        console.log("update topic:", updated);
      } else {
        const created: AdminTopic = {
          id: `t_${Date.now().toString(36)}`,
          ...data,
        };
        saveTopic(created);
        setTopics((prev) => [...prev, created]);
        const items = loadSidebarItems();
        const item = items.find((it) => it.id === params.id);
        if (item) {
          saveSidebarItems(
            items.map((it) =>
              it.id === item.id
                ? { ...it, topicIds: [...it.topicIds, created.id] }
                : it
            )
          );
        }
        console.log("create topic:", created, "-> item:", item?.name ?? itemName);
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (topic: AdminTopic) => {
    deleteTopic(topic.id);
    setTopics((prev) => prev.filter((t) => t.id !== topic.id));
    console.log("delete topic:", topic);
  };

  const columns: TableProps<AdminTopic>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (id: string) => <span className={styles.topicId}>{id}</span>,
    },
    {
      title: "Tên topic",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className={styles.topicName}>
          <TagsOutlined className={styles.topicIcon} />
          {name}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description: string) => (
        <span className={styles.description}>{description || "-"}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      render: (_: unknown, record: AdminTopic) => (
        <div className={styles.actions}>
          <Tooltip title="Tạo bài viết">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => router.push("/admin/create")}
              aria-label={`Tạo bài viết cho ${record.name}`}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              aria-label={`Sửa ${record.name}`}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa topic"
            description={`Xóa "${record.name}" sẽ bỏ gắn topic khỏi các mục sidebar.`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${record.name}`} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href="/admin/sidebar" className={styles.breadcrumbLink}>
                    Quản lý Sidebar
                  </Link>
                ),
              },
              { title: itemName ? `Tạo topic trong ${itemName}` : "Tạo topic" },
            ]}
          />
          <div className={styles.headerActions}>
            <Input
              prefix={<SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />}
              placeholder="Lọc theo tên hoặc mô tả"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={styles.search}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="note-btn-primary"
              onClick={openCreate}
            >
              Thêm topic
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
        okText={editing ? "Lưu thay đổi" : "Thêm topic"}
        cancelText="Hủy"
        title={editing ? "Sửa topic" : "Thêm topic mới"}
        destroyOnHidden
        afterOpenChange={(open) => {
          if (!open) return;
          if (editing) {
            form.setFieldsValue({
              name: editing.name,
              description: editing.description,
            });
          } else {
            form.resetFields();
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Tên topic"
            rules={[{ required: true, message: "Nhập tên topic" }]}
          >
            <Input placeholder="VD: Mẹo sống xanh" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              placeholder="VD: Chia sẻ các mẹo bảo vệ môi trường, sống xanh mỗi ngày."
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

export default function TopicPage() {
  return (
    <Suspense>
      <TopicCreatePage />
    </Suspense>
  );
}