"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  message,
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
  useCreateTopic,
  useDeleteTopic,
  useSidebar,
  useTopics,
  useUpdateTopic,
} from "@/hooks/use-api";
import { sidebarApi } from "@/lib/api";
import type { ApiTopic } from "@/lib/api";
import styles from "./topic.module.scss";

function TopicCreatePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiTopic | null>(null);
  const [form] = Form.useForm<{ name: string; description?: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  const topicsQuery = useTopics();
  const sidebarQuery = useSidebar();

  const topics: ApiTopic[] = useMemo(() => topicsQuery.data ?? [], [topicsQuery.data]);
  const itemName = searchParams.get("name") ?? "";

  const refreshSidebarItem = async (topicId: string) => {
    // Gắn topic mới vào mục sidebar hiện tại (replace-all API)
    const items = sidebarQuery.data ?? [];
    const target = items.find((it) => it.id === params.id);
    if (!target) return;

    const payload = items.map((item) =>
      item.id === target.id
        ? { ...item, topicIds: [...item.topicIds, topicId] }
        : item
    );
    await sidebarApi.replace(payload);
    await sidebarQuery.refetch();
  };

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const deleteMutation = useDeleteTopic();

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return topics;
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        (t.description ?? "").toLowerCase().includes(kw)
    );
  }, [topics, keyword]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (topic: ApiTopic) => {
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
        updateMutation.mutate(
          { id: editing.id, body: data },
          {
            onSuccess: () => messageApi.success("Đã cập nhật topic"),
            onError: () => messageApi.error("Cập nhật topic thất bại"),
          }
        );
      } else {
        createMutation.mutate(data, {
          onSuccess: async (created) => {
            messageApi.success("Đã thêm topic");
            try {
              await refreshSidebarItem(created.id);
            } catch {
              messageApi.warning("Đã tạo topic nhưng chưa gắn được vào mục sidebar");
            }
          },
          onError: () => messageApi.error("Thêm topic thất bại"),
        });
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (topic: ApiTopic) => {
    deleteMutation.mutate(topic.id, {
      onSuccess: () => messageApi.success(`Đã xóa topic "${topic.name}"`),
      onError: () => messageApi.error("Xóa topic thất bại"),
    });
  };

  const columns: TableProps<ApiTopic>["columns"] = [
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
      render: (_: unknown, record: ApiTopic) => (
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
      {contextHolder}
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
              description: editing.description ?? undefined,
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