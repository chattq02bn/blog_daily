"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
  SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminTags } from "@/data/admin";
import { loadTags, saveTags } from "@/lib/adminStorage";
import styles from "./tags.module.scss";

interface TagItem {
  id: string;
  name: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>(adminTags);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [form] = Form.useForm<{ name: string }>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được ở client sau khi mount
    setTags(loadTags());
  }, []);

  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return tags;
    return tags.filter(
      (t) => t.name.toLowerCase().includes(kw) || t.id.toLowerCase().includes(kw)
    );
  }, [tags, keyword]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tag: TagItem) => {
    setEditing(tag);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const name = values.name.trim();
      if (editing) {
        setTags((prev) => prev.map((t) => (t.id === editing.id ? { ...t, name } : t)));
        console.log("update tag:", { ...editing, name });
      } else {
        const newTag: TagItem = { id: `t_${Date.now().toString(36)}`, name };
        setTags((prev) => [newTag, ...prev]);
        console.log("create tag:", newTag);
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (tag: TagItem) => {
    setTags((prev) => prev.filter((t) => t.id !== tag.id));
    console.log("delete tag:", tag);
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
      render: (_: unknown, record: TagItem) => (
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
            <Input
              prefix={<SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />}
              placeholder="Lọc theo tên hoặc ID"
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
              Thêm tag
            </Button>
          </div>
        </div>
        <Table
          scroll={{ y: "calc(100dvh - 330px)" }}
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