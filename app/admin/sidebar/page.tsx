"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  TagsOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  loadSidebarItems,
  saveSidebarItems,
  seedSidebarItems,
  type SidebarItem,
} from "@/lib/adminStorage";
import styles from "./sidebar.module.scss";

function totalPosts(item: SidebarItem): number {
  if (item.children?.length) {
    return item.children.reduce((sum, c) => sum + c.postCount, 0);
  }
  return item.postCount;
}

function findParent(items: SidebarItem[], id: string): SidebarItem | null {
  for (const item of items) {
    if (item.children?.some((c) => c.id === id)) return item;
  }
  return null;
}

function isChild(items: SidebarItem[], id: string): boolean {
  return Boolean(findParent(items, id));
}

function removeItem(items: SidebarItem[], id: string): SidebarItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: item.children ? removeItem(item.children, id) : undefined,
    }));
}

function insertItem(
  items: SidebarItem[],
  item: SidebarItem,
  parentId?: string
): SidebarItem[] {
  if (!parentId) return [...items, item];
  return items.map((p) =>
    p.id === parentId ? { ...p, children: [...(p.children ?? []), item] } : p
  );
}

export default function AdminSidebarPage() {
  const router = useRouter();
  const [items, setItems] = useState<SidebarItem[]>(seedSidebarItems);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SidebarItem | null>(null);
  const [draftParentId, setDraftParentId] = useState<string | undefined>(undefined);
  const [form] = Form.useForm<{
    name: string;
    href: string;
    description?: string;
    parentId?: string;
  }>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được ở client sau khi mount
    setItems(loadSidebarItems());
  }, []);

  useEffect(() => {
    saveSidebarItems(items);
  }, [items]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return items;
    const matches = (item: SidebarItem) =>
      item.name.toLowerCase().includes(kw) ||
      item.href.toLowerCase().includes(kw) ||
      (item.description ?? "").toLowerCase().includes(kw);
    return items
      .filter((p) => matches(p) || p.children?.some(matches))
      .map((p) => ({
        ...p,
        children: p.children?.filter(matches),
      }));
  }, [items, keyword]);

  const allParentIds = useMemo(
    () => items.filter((item) => item.children?.length).map((item) => item.id),
    [items]
  );

  const parentOptions = items.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const openCreate = () => {
    setEditing(null);
    setDraftParentId(undefined);
    setModalOpen(true);
  };

  const openCreateChild = (parent: SidebarItem) => {
    setEditing(null);
    setDraftParentId(parent.id);
    setModalOpen(true);
  };

  const openEdit = (item: SidebarItem) => {
    setEditing(item);
    setDraftParentId(undefined);
    setModalOpen(true);
  };

  const openCreateTopic = (item: SidebarItem) => {
    router.push(`/admin/sidebar/topic/${item.id}?name=${encodeURIComponent(item.name)}`);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const { name, href, description, parentId } = values;
      if (editing) {
        const updated: SidebarItem = {
          ...editing,
          name: name.trim(),
          href: href.trim(),
          description: description?.trim() || undefined,
        };
        const rest = removeItem(items, editing.id);
        setItems(insertItem(rest, updated, parentId));
        console.log("update sidebar item:", updated, "parent:", parentId);
      } else {
        const created: SidebarItem = {
          id: `s_${Date.now().toString(36)}`,
          name: name.trim(),
          href: href.trim(),
          postCount: 0,
          topicIds: [],
          description: description?.trim() || undefined,
        };
        setItems(insertItem(items, created, parentId));
        console.log("create sidebar item:", created, "parent:", parentId);
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (item: SidebarItem) => {
    setItems(removeItem(items, item.id));
    console.log("delete sidebar item:", item);
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 260,
      render: (name: string, record: SidebarItem) => {
        const child = isChild(items, record.id);
        return (
          <div className={styles.nameCell}>
            {child && <div className={styles.childSpacer} aria-hidden="true" />}
            <div className={child ? styles.childName : styles.itemName}>
              {name}
            </div>
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 240,
      ellipsis: true,
      render: (description: string | undefined) =>
        description ? (
          <span className={styles.description}>{description}</span>
        ) : (
          <span className={styles.noDescription}>—</span>
        ),
    },
    {
      title: "Đường dẫn",
      dataIndex: "href",
      key: "href",
      width: 200,
      render: (href: string) => <span className={styles.href}>{href}</span>,
    },
    {
      title: "Cấp",
      key: "level",
      width: 100,
      render: (_: unknown, record: SidebarItem) => (
        <Tag className={styles.levelTag}>
          {isChild(items, record.id) ? "Mục con" : "Mục cha"}
        </Tag>
      ),
    },
    {
      title: "Số topic",
      key: "topicCount",
      width: 100,
      render: (_: unknown, record: SidebarItem) => (
        <span className={styles.topicCount}>{record.topicIds.length}</span>
      ),
    },
    {
      title: "Bài viết",
      key: "postCount",
      width: 110,
      render: (_: unknown, record: SidebarItem) => (
        <span className={styles.postCount}>{totalPosts(record)}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 240,
      render: (_: unknown, record: SidebarItem) => (
        <div className={styles.actions}>
          {!isChild(items, record.id) && (
            <Tooltip title="Thêm mục con">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => openCreateChild(record)}
                aria-label={`Thêm mục con cho ${record.name}`}
              />
            </Tooltip>
          )}
          <Tooltip title="Tạo topic">
            <Button
              type="text"
              icon={<TagsOutlined />}
              onClick={() => openCreateTopic(record)}
              aria-label={`Tạo topic cho ${record.name}`}
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
            title="Xóa mục"
            description={
              record.children?.length
                ? `Xóa "${record.name}" sẽ xóa luôn ${record.children.length} mục con.`
                : `Bạn có chắc muốn xóa "${record.name}"?`
            }
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
        <div className={styles.header}>
          <h1 className={styles.heading}>Quản lý Sidebar</h1>
          <div className={styles.headerActions}>
            <Input
              prefix={<SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />}
              placeholder="Lọc theo tên hoặc đường dẫn"
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
              Thêm mục
            </Button>
          </div>
        </div>
        <Table
          scroll={{ x: 1250, y: "calc(100dvh - 250px)" }}
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={false}
          indentSize={1}
          expandable={{
            defaultExpandAllRows: true,
            expandedRowKeys: keyword.trim() ? allParentIds : undefined,
          }}
        />
      </div>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Lưu thay đổi" : "Thêm mục"}
        cancelText="Hủy"
        title={editing ? "Sửa mục sidebar" : "Thêm mục sidebar"}
        destroyOnHidden
        afterOpenChange={(open) => {
          if (!open) return;
          if (editing) {
            const parent = findParent(items, editing.id);
            form.setFieldsValue({
              name: editing.name,
              href: editing.href,
              description: editing.description,
              parentId: parent?.id,
            });
          } else {
            form.resetFields();
            if (draftParentId) form.setFieldsValue({ parentId: draftParentId });
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Nhập tên mục" }]}
          >
            <Input placeholder="VD: Thử thách" />
          </Form.Item>
          <Form.Item
            name="href"
            label="Đường dẫn"
            rules={[{ required: true, message: "Nhập đường dẫn" }]}
          >
            <Input placeholder="VD: /topic/challenge" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea
              rows={2}
              placeholder="Mô tả ngắn về mục này (hiển thị trong bảng)"
              maxLength={200}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="Mục cha (để trống = mục cha)"
            rules={[
              {
                validator: (_, value: string | undefined) => {
                  if (editing?.children?.length && value) {
                    return Promise.reject(
                      new Error("Mục đang có mục con không thể trở thành mục con")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              options={parentOptions}
              allowClear
              placeholder="Chọn mục cha"
              disabled={Boolean(editing?.children?.length)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}