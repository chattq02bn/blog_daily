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
  useSidebar,
  useTopics,
  useUpdateTopic,
} from "@/hooks/use-api";
import { sidebarApi } from "@/lib/api";
import type { ApiTopic } from "@/lib/api";
import styles from "./topic.module.scss";

const PAGE_SIZE = 20;

function TopicCreatePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiTopic | null>(null);

  const [form] = Form.useForm<{ name: string; description?: string }>();

  const [messageApi, contextHolder] = message.useMessage();

  const itemName = searchParams.get("name") ?? "";

  const topicsQuery = useTopics({
    page,
    limit: PAGE_SIZE,
    q: keyword || undefined,
  });

  const sidebarQuery = useSidebar();

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const deleteMutation = useDeleteTopic();

  const topics: ApiTopic[] = topicsQuery.data?.data ?? [];
  const meta = topicsQuery.data?.meta;

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
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
      const items = sidebarQuery.data ?? [];
      const target = items.find((item) => item.id === params.id);
      if (!target) return;

      const topicIds = target.topicIds.includes(topicId)
        ? target.topicIds
        : [...target.topicIds, topicId];

      const payload = items.map((item) =>
        item.id === target.id ? { ...item, topicIds } : item
      );

      await sidebarApi.replace(payload);
      await sidebarQuery.refetch();
    },
    [sidebarQuery.data, sidebarQuery.refetch, params.id]
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
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: meta?.total ?? 0,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
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
