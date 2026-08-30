"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  App,
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
import { useCreateSidebarItem, useReplaceSidebar, useSidebar } from "@/hooks/use-api";
import type { ApiSidebarItem } from "@/lib/api";
import styles from "./sidebar.module.scss";

interface SidebarItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  topicIds: string[];
  description?: string;
  idx: number;
  children?: SidebarItem[];
}

function apiToItem(item: ApiSidebarItem): SidebarItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description ?? undefined,
    idx: item.idx,
    topicIds: item.topicIds,
    postCount: item.postCount ?? 0,
    children: item.children.length
      ? item.children.map((child) => apiToItem(child))
      : undefined,
  };
}

function itemToApiPayload(item: SidebarItem): Record<string, unknown> {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description ?? null,
    idx: item.idx,
    topicIds: item.topicIds,
    ...(item.children?.length
      ? { children: item.children.map(itemToApiPayload) }
      : { children: [] }),
  };
}

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

/* Tự sinh slug từ tên — dùng cho /topic/[slug] khi click mục sidebar */
function slugify(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "muc";
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
  const { message } = App.useApp();
  const router = useRouter();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SidebarItem | null>(null);
  const [draftParentId, setDraftParentId] = useState<string | undefined>(undefined);
  const [form] = Form.useForm<{
    name: string;
    description?: string;
    parentId?: string;
  }>();

  const sidebarQuery = useSidebar();
  const createMutation = useCreateSidebarItem();
  const replaceMutation = useReplaceSidebar();

  /* Nap du lieu tu API vao state lan dau */
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !sidebarQuery.data) return;
    hydratedRef.current = true;
    setItems(sidebarQuery.data.map((item) => apiToItem(item)));
  }, [sidebarQuery.data]);

  /* Tự lưu lên server (debounce) sau mỗi thay đổi cục bộ */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedSaveRef = useRef(false);
  const skipSaveRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current) return;
    /* Bo qua lan hydrate dau tien — chi save khi user thuc su thay doi */
    if (!hydratedSaveRef.current) {
      hydratedSaveRef.current = true;
      return;
    }
    /* Bo qua khi create thanh cong — da push item vao state, khong can PUT */
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      replaceMutation.mutate(
        items.map(itemToApiPayload),
        {
          onError: () => message.error("Lưu sidebar thất bại"),
        }
      );
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chi chay khi items doi
  }, [items]);

  /* Trạng thái kéo thả lưu trong ref — không setState trong dragover để tránh lag */
  const sortedRef = useRef<SidebarItem[]>([]);
  const dragInfo = useRef<{
    id: string | null;
    parentId: string | null;
    sourceRow: HTMLElement | null;
    indicator: HTMLElement | null;
  }>({ id: null, parentId: null, sourceRow: null, indicator: null });

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const scrollRaf = useRef<number>(0);
  const scrollDir = useRef<-1 | 0 | 1>(0);

  const EDGE_ZONE = 60;
  const SCROLL_SPEED = 6;

  const autoScroll = () => {
    if (scrollDir.current === 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop += scrollDir.current * SCROLL_SPEED;
    scrollRaf.current = requestAnimationFrame(autoScroll);
  };

  const startAutoScroll = (dir: -1 | 1) => {
    if (scrollDir.current === dir) return;
    scrollDir.current = dir;
    cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(autoScroll);
  };

  const stopAutoScroll = () => {
    scrollDir.current = 0;
    cancelAnimationFrame(scrollRaf.current);
  };

  const handleWheel = (e: WheelEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollTop += e.deltaY;
  };

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

  const cleanupDrag = () => {
    stopAutoScroll();
    scrollContainerRef.current?.removeEventListener("wheel", handleWheel);
    scrollContainerRef.current = null;
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

      const wrapper = document.querySelector(`.${styles.wrap}`);
      scrollContainerRef.current = wrapper?.querySelector(".ant-table-body") as HTMLElement | null;
      scrollContainerRef.current?.addEventListener("wheel", handleWheel, { passive: false });
    },
    onDragOver: (e) => {
      if (!dragInfo.current.id || dragInfo.current.id === record.id) return;
      if (dragInfo.current.parentId !== levelOf(record.id)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIndicator(e.currentTarget);

      const container = scrollContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const y = e.clientY - rect.top;
        if (y < EDGE_ZONE) {
          startAutoScroll(-1);
        } else if (y > rect.height - EDGE_ZONE) {
          startAutoScroll(1);
        } else {
          stopAutoScroll();
        }
      }
    },
    onDrop: (e) => {
      e.preventDefault();
      cleanupDrag();
      const draggedId = dragInfo.current.id;
      if (draggedId && draggedId !== record.id) {
        setItems((prev) => reorderTree(sortTree(prev), draggedId, record.id));
      }
      endDrag(e.currentTarget);
    },
    onDragEnd: (e) => {
      cleanupDrag();
      endDrag(e.currentTarget);
    },
  });

  const sorted = useMemo(() => sortTree(items), [items]);

  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return sorted;
    const matches = (item: SidebarItem) =>
      item.name.toLowerCase().includes(kw) ||
      item.slug.toLowerCase().includes(kw) ||
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { name, description, parentId } = values;
      if (editing) {
        const updated: SidebarItem = {
          ...editing,
          name: name.trim(),
          slug: editing.slug || slugify(name.trim()),
          description: description?.trim() || undefined,
        };
        const replaceInTree = (list: SidebarItem[]): SidebarItem[] =>
          list.map((item) => {
            if (item.id === editing.id) return { ...updated, idx: item.idx, children: item.children };
            if (item.children) return { ...item, children: replaceInTree(item.children) };
            return item;
          });
        setItems(replaceInTree(items));
        message.success("Đã cập nhật mục sidebar");
        setModalOpen(false);
      } else {
        const slug = slugify(name.trim());
        const data = await createMutation.mutateAsync({
          name: name.trim(),
          slug,
          description: description?.trim() || undefined,
          parentId,
        });
        const created: SidebarItem = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description ?? undefined,
          postCount: data.postCount ?? 0,
          topicIds: data.topicIds,
          idx: data.idx,
        };
        skipSaveRef.current = true;
        setItems(insertItem(items, created, parentId));
        message.success("Đã tạo mục sidebar");
        setModalOpen(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("Thao tác thất bại");
    }
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
              placeholder="Lọc theo tên"
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
        confirmLoading={createMutation.isPending}
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