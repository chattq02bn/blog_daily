"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  HolderOutlined,
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
  if (!parentId) {
    const idx = items.reduce((max, i) => Math.max(max, i.idx), -1) + 1;
    return [...items, { ...item, idx }];
  }
  return items.map((p) => {
    if (p.id !== parentId) return p;
    const children = p.children ?? [];
    const idx = children.reduce((max, c) => Math.max(max, c.idx), -1) + 1;
    return { ...p, children: [...children, { ...item, idx }] };
  });
}

function sortTree(items: SidebarItem[]): SidebarItem[] {
  return [...items]
    .sort((a, b) => a.idx - b.idx)
    .map((item) => ({
      ...item,
      children: item.children ? sortTree(item.children) : undefined,
    }));
}

function moveWithinLevel(list: SidebarItem[], dragId: string, targetId: string): SidebarItem[] {
  const from = list.findIndex((i) => i.id === dragId);
  const to = list.findIndex((i) => i.id === targetId);
  if (from === -1 || to === -1 || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((item, i) => ({ ...item, idx: i }));
}

/* Chỉ cho phép kéo thả trong cùng một cấp — khác cấp thì giữ nguyên cây */
function reorderTree(items: SidebarItem[], dragId: string, targetId: string): SidebarItem[] {
  const dragParentId = findParent(items, dragId)?.id ?? null;
  const targetParentId = findParent(items, targetId)?.id ?? null;
  if (dragParentId !== targetParentId) return items;

  if (dragParentId === null) return moveWithinLevel(items, dragId, targetId);
  return items.map((p) =>
    p.id === dragParentId && p.children
      ? { ...p, children: moveWithinLevel(p.children, dragId, targetId) }
      : p
  );
}

/* Row component đặt ngoài component chính để không bị remount khi re-render */
function DragRow({ children, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...rest}>{children}</tr>;
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

  /* Trạng thái kéo thả lưu trong ref — không setState trong dragover để tránh lag */
  const sortedRef = useRef<SidebarItem[]>([]);
  const dragInfo = useRef<{
    id: string | null;
    parentId: string | null;
    sourceRow: HTMLElement | null;
    indicator: HTMLElement | null;
  }>({ id: null, parentId: null, sourceRow: null, indicator: null });

  const levelOf = (id: string): string | null =>
    findParent(sortedRef.current, id)?.id ?? null;

  const setIndicator = (row: HTMLElement | null) => {
    if (dragInfo.current.indicator === row) return;
    dragInfo.current.indicator?.classList.remove(styles.dropTarget);
    row?.classList.add(styles.dropTarget);
    dragInfo.current.indicator = row;
  };

  const endDrag = (row: HTMLElement) => {
    row.classList.remove(styles.dragging);
    row.removeAttribute("draggable");
    setIndicator(null);
    dragInfo.current = { id: null, parentId: null, sourceRow: null, indicator: null };
  };

  const enableRowDrag = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).closest("tr")?.setAttribute("draggable", "true");
  };

  const disableRowDrag = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).closest("tr")?.removeAttribute("draggable");
  };

  const getRowProps = (record: SidebarItem): React.HTMLAttributes<HTMLTableRowElement> => ({
    draggable: false,
    onDragStart: (e) => {
      dragInfo.current.id = record.id;
      dragInfo.current.parentId = levelOf(record.id);
      dragInfo.current.sourceRow = e.currentTarget;
      e.currentTarget.classList.add(styles.dragging);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", record.id);
    },
    onDragOver: (e) => {
      if (!dragInfo.current.id || dragInfo.current.id === record.id) return;
      if (dragInfo.current.parentId !== levelOf(record.id)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIndicator(e.currentTarget);
    },
    onDrop: (e) => {
      e.preventDefault();
      const draggedId = dragInfo.current.id;
      if (draggedId && draggedId !== record.id) {
        setItems((prev) => reorderTree(sortTree(prev), draggedId, record.id));
      }
      endDrag(e.currentTarget);
    },
    onDragEnd: (e) => endDrag(e.currentTarget),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được ở client sau khi mount
    setItems(loadSidebarItems());
  }, []);

  useEffect(() => {
    saveSidebarItems(items);
  }, [items]);

  const sorted = useMemo(() => sortTree(items), [items]);

  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return sorted;
    const matches = (item: SidebarItem) =>
      item.name.toLowerCase().includes(kw) ||
      item.href.toLowerCase().includes(kw) ||
      (item.description ?? "").toLowerCase().includes(kw);
    return sorted
      .filter((p) => matches(p) || p.children?.some(matches))
      .map((p) => ({
        ...p,
        children: p.children?.filter(matches),
      }));
  }, [sorted, keyword]);

  const allParentIds = useMemo(
    () => sorted.filter((item) => item.children?.length).map((item) => item.id),
    [sorted]
  );

  const parentOptions = sorted.map((item) => ({
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
        const rest = removeItem(sorted, editing.id);
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
          idx: 0,
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
      title: "",
      key: "drag",
      width: 40,
      render: (_: unknown, record: SidebarItem) => (
        <span
          className={styles.dragHandle}
          title="Kéo để sắp xếp"
          aria-label={`Kéo để sắp xếp ${record.name}`}
          onMouseDown={enableRowDrag}
          onMouseUp={disableRowDrag}
        >
          <HolderOutlined />
        </span>
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 260,
      render: (name: string, record: SidebarItem) => {
        const child = isChild(sorted, record.id);
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
          {!isChild(sorted, record.id) && (
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
          scroll={{ x: 1290, y: "calc(100dvh - 250px)" }}
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={false}
          indentSize={1}
          components={{ body: { row: DragRow } }}
          onRow={getRowProps}
          expandable={{
            defaultExpandAllRows: true,
            expandedRowKeys: keyword.trim() ? allParentIds : undefined,
            expandIconColumnIndex: 1,
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
            const parent = findParent(sorted, editing.id);
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