"use client";

import { useCallback, useState } from "react";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import SearchInput from "@/components/admin/SearchInput";
import {
  useCreateTag,
  useDeleteTag,
  useTags,
  useUpdateTag,
} from "@/hooks/use-api";
import type { ApiTag } from "@/lib/api";
import styles from "./tags.module.scss";

const PAGE_SIZE = 20;

export default function AdminTagsPage() {
  const { message } = App.useApp();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiTag | null>(null);

  const [form] = Form.useForm<{ name: string }>();

  const tagsQuery = useTags({
    page,
    limit: PAGE_SIZE,
    q: keyword || undefined,
  });

  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const tags = tagsQuery.data?.data ?? [];
  const meta = tagsQuery.data?.meta;

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tag: ApiTag) => {
    setEditing(tag);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const name = values.name.trim();

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name });
        message.success("Đã cập nhật tag");
      } else {
        await createMutation.mutateAsync(name);
        message.success("Đã thêm tag");
      }

      setModalOpen(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = (tag: ApiTag) => {
    deleteMutation.mutate(tag.id, {
      onSuccess: () => message.success(`Đã xóa tag "${tag.name}"`),
      onError: () => message.error("Xóa tag thất bại"),
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 140,
      render: (id: string) => <span className={styles.tagId}>{id}</span>,
    },
    {
      title: "Tên tag",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className={styles.tagName}>{name}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_: unknown, record: ApiTag) => (
        <div className={styles.actions}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              aria-label={`Sửa ${record.name}`}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tag"
            description={`Bạn có chắc muốn xóa tag "${record.name}"?`}
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
  ];

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Quản lý tag</h1>

          <div className={styles.headerActions}>
            <SearchInput
              placeholder="Lọc theo tên"
              onSearch={handleSearch}
              className={styles.search}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="note-btn-primary"
              onClick={openCreate}
            >
              Thêm tag
            </Button>
          </div>
        </div>

        <Table
          scroll={{ x: "max-content", y: "calc(100dvh - 300px)" }}
          rowKey="id"
          columns={columns}
          dataSource={tags}
          loading={tagsQuery.isLoading || tagsQuery.isFetching}
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
        okText={editing ? "Lưu thay đổi" : "Thêm tag"}
        cancelText="Hủy"
        title={editing ? "Sửa tag" : "Thêm tag mới"}
        destroyOnHidden
        afterOpenChange={(open) => {
          if (!open) return;
          if (editing) {
            form.setFieldsValue({ name: editing.name });
          } else {
            form.resetFields();
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Tên tag"
            rules={[{ required: true, message: "Nhập tên tag" }]}
          >
            <Input placeholder="VD: Mẹo sống xanh" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
