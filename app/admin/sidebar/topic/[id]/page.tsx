"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
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
  TagsOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import SearchInput from "@/components/admin/SearchInput";
import {
  useCreateTopic,
  useDeleteTopic,
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

  const itemName = searchParams.get("name") ?? "";

  const topicsQuery = useTopics({
    page: 1,
    limit: 20,
    q: keyword || undefined,
    sidebarId: params.id,
  });

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const deleteMutation = useDeleteTopic();

  const topics: ApiTopic[] = topicsQuery.data?.data ?? [];

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((topic: ApiTopic) => {
    setEditing(topic);
    setModalOpen(true);
  }, []);

  const refreshSidebarItem = useCallback(
    async (topicId: string) => {
      await sidebarApi.patchTopics(params.id, { addTopicId: topicId });
    },
    [params.id]
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const data = { name: values.name.trim(), description: values.description?.trim() ?? "" };

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, body: data });
        messageApi.success("Đã cập nhật topic");
      } else {
        const created = await createMutation.mutateAsync(data);
        messageApi.success("Đã thêm topic");

        try {
          await refreshSidebarItem(created.id);
        } catch {
          messageApi.warning("Đã tạo topic nhưng chưa gắn được vào mục sidebar");
        }
      }

      setModalOpen(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      messageApi.error("Thao tác thất bại");
    }
  }, [form, editing, updateMutation, createMutation, messageApi, refreshSidebarItem]);

  const handleDelete = useCallback(
    (topic: ApiTopic) => {
      deleteMutation.mutate(topic.id, {
        onSuccess: () => messageApi.success(`Đã xóa topic "${topic.name}"`),
        onError: () => messageApi.error("Xóa topic thất bại"),
      });
    },
    [deleteMutation, messageApi]
  );

  const columns: TableProps<ApiTopic>["columns"] = useMemo(
    () => [
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
        title: "Bài viết",
        dataIndex: "postCount",
        key: "postCount",
        width: 100,
        render: (postCount: number) => (
          <span className={styles.postCount}>{postCount}</span>
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
                onClick={() => router.push(`/admin/create?topicId=${record.id}`)}
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
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Xóa ${record.name}`}
              />
            </Popconfirm>
          </div>
        ),
      },
    ],
    [router, openEdit, handleDelete]
  );

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
              {
                title: itemName ? `Tạo topic trong ${itemName}` : "Tạo topic",
              },
            ]}
          />

          <div className={styles.headerActions}>
            <SearchInput
              placeholder="Lọc theo tên hoặc mô tả"
              onSearch={handleSearch}
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
          dataSource={topics}
          loading={topicsQuery.isLoading || topicsQuery.isFetching}
          pagination={false}
        />
      </div>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editing ? "Lưu thay đổi" : "Thêm topic"}
        cancelText="Hủy"
        title={editing ? "Sửa topic" : "Thêm topic mới"}
        destroyOnHidden
        afterOpenChange={(open) => {
          if (!open) return;
          if (editing) {
            form.setFieldsValue({ name: editing.name, description: editing.description ?? undefined });
          } else {
            form.resetFields();
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên topic" rules={[{ required: true, message: "Nhập tên topic" }]}>
            <Input placeholder="VD: Mẹo sống xanh" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="VD: Chia sẻ các mẹo bảo vệ môi trường, sống xanh mỗi ngày." rows={3} />
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
