"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
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
import type { TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  PlusOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import SearchInput from "@/components/admin/SearchInput";
import {
  useCreateSidebarItem,
  useReplaceSidebar,
  useSidebar,
} from "@/hooks/use-api";
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

/* =========================================================
 * HELPERS
 * ========================================================= */

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
      ? item.children.map(apiToItem)
      : undefined,
  };
}

function itemToApiPayload(
  item: SidebarItem
): Record<string, unknown> {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description ?? null,
    idx: item.idx,
    topicIds: item.topicIds,
    ...(item.children?.length
      ? {
        children: item.children.map(
          itemToApiPayload
        ),
      }
      : {
        children: [],
      }),
  };
}

function totalPosts(item: SidebarItem): number {
  if (item.children?.length) {
    return item.children.reduce(
      (sum, child) => sum + child.postCount,
      0
    );
  }

  return item.postCount;
}

function findParent(
  items: SidebarItem[],
  id: string
): SidebarItem | null {
  for (const item of items) {
    if (
      item.children?.some(
        (child) => child.id === id
      )
    ) {
      return item;
    }
  }

  return null;
}

function isChild(
  items: SidebarItem[],
  id: string
): boolean {
  return Boolean(findParent(items, id));
}

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

function removeItem(
  items: SidebarItem[],
  id: string
): SidebarItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: item.children
        ? removeItem(item.children, id)
        : undefined,
    }));
}

function insertItem(
  items: SidebarItem[],
  item: SidebarItem,
  parentId?: string
): SidebarItem[] {
  if (!parentId) {
    const idx =
      items.reduce(
        (max, current) =>
          Math.max(max, current.idx),
        -1
      ) + 1;

    return [
      ...items,
      {
        ...item,
        idx,
      },
    ];
  }

  return items.map((parent) => {
    if (parent.id !== parentId) {
      return parent;
    }

    const children = parent.children ?? [];

    const idx =
      children.reduce(
        (max, child) =>
          Math.max(max, child.idx),
        -1
      ) + 1;

    return {
      ...parent,
      children: [
        ...children,
        {
          ...item,
          idx,
        },
      ],
    };
  });
}

function sortTree(
  items: SidebarItem[]
): SidebarItem[] {
  return [...items]
    .sort((a, b) => a.idx - b.idx)
    .map((item) => ({
      ...item,
      children: item.children
        ? sortTree(item.children)
        : undefined,
    }));
}

function moveWithinLevel(
  list: SidebarItem[],
  dragId: string,
  targetId: string
): SidebarItem[] {
  const from = list.findIndex(
    (item) => item.id === dragId
  );

  const to = list.findIndex(
    (item) => item.id === targetId
  );

  if (
    from === -1 ||
    to === -1 ||
    from === to
  ) {
    return list;
  }

  const next = [...list];

  const [moved] = next.splice(from, 1);

  next.splice(to, 0, moved);

  return next.map((item, index) => ({
    ...item,
    idx: index,
  }));
}

function reorderTree(
  items: SidebarItem[],
  dragId: string,
  targetId: string
): SidebarItem[] {
  const dragParentId =
    findParent(items, dragId)?.id ?? null;

  const targetParentId =
    findParent(items, targetId)?.id ?? null;

  /*
   * Chỉ cho phép kéo trong cùng một cấp.
   */
  if (dragParentId !== targetParentId) {
    return items;
  }

  if (dragParentId === null) {
    return moveWithinLevel(
      items,
      dragId,
      targetId
    );
  }

  return items.map((parent) =>
    parent.id === dragParentId &&
      parent.children
      ? {
        ...parent,
        children: moveWithinLevel(
          parent.children,
          dragId,
          targetId
        ),
      }
      : parent
  );
}

/* =========================================================
 * DRAG ROW
 * ========================================================= */

const DragRow = memo(function DragRow({
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...rest}>{children}</tr>;
});

/* =========================================================
 * PAGE
 * ========================================================= */

export default function AdminSidebarPage() {
  const { message } = App.useApp();
  const router = useRouter();

  const [items, setItems] = useState<
    SidebarItem[]
  >([]);

  const [keyword, setKeyword] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<SidebarItem | null>(null);

  const [draftParentId, setDraftParentId] =
    useState<string | undefined>(
      undefined
    );

  const [form] = Form.useForm<{
    name: string;
    description?: string;
    parentId?: string;
  }>();

  const isSearching = keyword.trim().length > 0;

  const sidebarQuery = useSidebar(
    isSearching ? { q: keyword.trim() } : undefined
  );

  const createMutation =
    useCreateSidebarItem();

  const replaceMutation =
    useReplaceSidebar();

  /* =======================================================
   * HYDRATE
   * ======================================================= */

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (
      hydratedRef.current ||
      !sidebarQuery.data ||
      isSearching
    ) {
      return;
    }

    hydratedRef.current = true;

    setItems(
      sidebarQuery.data.map(apiToItem)
    );
  }, [sidebarQuery.data, isSearching]);

  /* =======================================================
   * AUTO SAVE
   * ======================================================= */

  const saveTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const hydratedSaveRef =
    useRef(false);

  const skipSaveRef =
    useRef(false);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    /*
     * Bỏ qua lần hydrate đầu tiên.
     */
    if (!hydratedSaveRef.current) {
      hydratedSaveRef.current = true;
      return;
    }

    /*
     * Create API đã tự lưu.
     */
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      replaceMutation.mutate(
        items.map(itemToApiPayload),
        {
          onError: () => {
            message.error(
              "Lưu sidebar thất bại"
            );
          },
        }
      );
    }, 600);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };

    // Chỉ chạy khi items thay đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  /* =======================================================
   * DRAG STATE
   * ======================================================= */

  const sortedRef =
    useRef<SidebarItem[]>([]);

  const dragInfo = useRef<{
    id: string | null;
    parentId: string | null;
    sourceRow: HTMLElement | null;
    indicator: HTMLElement | null;
  }>({
    id: null,
    parentId: null,
    sourceRow: null,
    indicator: null,
  });

  const scrollContainerRef =
    useRef<HTMLElement | null>(null);

  const scrollRaf =
    useRef<number>(0);

  const scrollDir =
    useRef<-1 | 0 | 1>(0);

  const EDGE_ZONE = 60;
  const SCROLL_SPEED = 6;

  const autoScroll = useCallback(() => {
    if (scrollDir.current === 0) {
      return;
    }

    const element =
      scrollContainerRef.current;

    if (!element) {
      return;
    }

    element.scrollTop +=
      scrollDir.current * SCROLL_SPEED;

    scrollRaf.current =
      requestAnimationFrame(
        autoScroll
      );
  }, []);

  const startAutoScroll = useCallback(
    (direction: -1 | 1) => {
      if (
        scrollDir.current === direction
      ) {
        return;
      }

      scrollDir.current = direction;

      cancelAnimationFrame(
        scrollRaf.current
      );

      scrollRaf.current =
        requestAnimationFrame(
          autoScroll
        );
    },
    [autoScroll]
  );

  const stopAutoScroll =
    useCallback(() => {
      scrollDir.current = 0;

      cancelAnimationFrame(
        scrollRaf.current
      );
    }, []);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const element =
        scrollContainerRef.current;

      if (!element) {
        return;
      }

      event.preventDefault();

      element.scrollTop += event.deltaY;
    },
    []
  );

  const levelOf = useCallback(
    (id: string): string | null => {
      return (
        findParent(
          sortedRef.current,
          id
        )?.id ?? null
      );
    },
    []
  );

  const setIndicator = useCallback(
    (row: HTMLElement | null) => {
      if (
        dragInfo.current.indicator ===
        row
      ) {
        return;
      }

      dragInfo.current.indicator?.classList.remove(
        styles.dropTarget
      );

      row?.classList.add(
        styles.dropTarget
      );

      dragInfo.current.indicator =
        row;
    },
    []
  );

  const endDrag = useCallback(
    (row: HTMLElement) => {
      row.classList.remove(
        styles.dragging
      );

      row.removeAttribute(
        "draggable"
      );

      setIndicator(null);

      dragInfo.current = {
        id: null,
        parentId: null,
        sourceRow: null,
        indicator: null,
      };
    },
    [setIndicator]
  );

  const cleanupDrag = useCallback(() => {
    stopAutoScroll();

    scrollContainerRef.current?.removeEventListener(
      "wheel",
      handleWheel
    );

    scrollContainerRef.current = null;
  }, [
    stopAutoScroll,
    handleWheel,
  ]);

  const enableRowDrag = useCallback(
    (event: React.MouseEvent) => {
      (
        event.currentTarget as HTMLElement
      )
        .closest("tr")
        ?.setAttribute(
          "draggable",
          "true"
        );
    },
    []
  );

  const disableRowDrag = useCallback(
    (event: React.MouseEvent) => {
      (
        event.currentTarget as HTMLElement
      )
        .closest("tr")
        ?.removeAttribute(
          "draggable"
        );
    },
    []
  );

  /* =======================================================
   * SORTED
   * ======================================================= */

  const sorted = useMemo(
    () => sortTree(items),
    [items]
  );

  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  /* =======================================================
   * FILTER — khi search: dùng API response; khi không: dùng local filter
   * ======================================================= */

  const searchResults = useMemo(() => {
    if (!isSearching || !sidebarQuery.data) return [];
    return sidebarQuery.data.map(apiToItem);
  }, [isSearching, sidebarQuery.data]);

  const filtered = useMemo(() => {
    if (isSearching) return searchResults;

    const kw = keyword.trim().toLowerCase();
    if (!kw) return sorted;

    const matches = (item: SidebarItem) =>
      item.name.toLowerCase().includes(kw) ||
      item.slug.toLowerCase().includes(kw) ||
      (item.description ?? "").toLowerCase().includes(kw);

    return sorted
      .filter(
        (parent) =>
          matches(parent) ||
          parent.children?.some(matches)
      )
      .map((parent) => ({
        ...parent,
        children: parent.children?.filter(matches),
      }));
  }, [isSearching, searchResults, sorted, keyword]);

  /* =======================================================
   * OPTIONS
   * ======================================================= */

  const allParentIds = useMemo(
    () =>
      filtered
        .filter(
          (item) =>
            item.children?.length
        )
        .map((item) => item.id),
    [filtered]
  );

  const parentOptions = useMemo(
    () =>
      sorted.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [sorted]
  );

  /* =======================================================
   * ACTIONS
   * ======================================================= */

  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
    },
    []
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setDraftParentId(undefined);
    setModalOpen(true);
  }, []);

  const openCreateChild = useCallback(
    (parent: SidebarItem) => {
      setEditing(null);
      setDraftParentId(parent.id);
      setModalOpen(true);
    },
    []
  );

  const openEdit = useCallback(
    (item: SidebarItem) => {
      setEditing(item);
      setDraftParentId(undefined);
      setModalOpen(true);
    },
    []
  );

  const openCreateTopic =
    useCallback(
      (item: SidebarItem) => {
        router.push(
          `/admin/sidebar/topic/${item.id}?name=${encodeURIComponent(
            item.name
          )}`
        );
      },
      [router]
    );

  /* =======================================================
   * DRAG ROW PROPS
   * ======================================================= */

  const getRowProps = useCallback(
    (
      record: SidebarItem
    ): React.HTMLAttributes<HTMLTableRowElement> => ({
      draggable: false,

      onDragStart: (event) => {
        dragInfo.current.id =
          record.id;

        dragInfo.current.parentId =
          levelOf(record.id);

        dragInfo.current.sourceRow =
          event.currentTarget;

        event.currentTarget.classList.add(
          styles.dragging
        );

        event.dataTransfer.effectAllowed =
          "move";

        event.dataTransfer.setData(
          "text/plain",
          record.id
        );

        const wrapper =
          document.querySelector(
            `.${styles.wrap}`
          );

        scrollContainerRef.current =
          wrapper?.querySelector(
            ".ant-table-body"
          ) as HTMLElement | null;

        scrollContainerRef.current?.addEventListener(
          "wheel",
          handleWheel,
          {
            passive: false,
          }
        );
      },

      onDragOver: (event) => {
        if (
          !dragInfo.current.id ||
          dragInfo.current.id ===
          record.id
        ) {
          return;
        }

        if (
          dragInfo.current.parentId !==
          levelOf(record.id)
        ) {
          return;
        }

        event.preventDefault();

        event.dataTransfer.dropEffect =
          "move";

        setIndicator(
          event.currentTarget
        );

        const container =
          scrollContainerRef.current;

        if (!container) {
          return;
        }

        const rect =
          container.getBoundingClientRect();

        const y =
          event.clientY - rect.top;

        if (y < EDGE_ZONE) {
          startAutoScroll(-1);
        } else if (
          y >
          rect.height - EDGE_ZONE
        ) {
          startAutoScroll(1);
        } else {
          stopAutoScroll();
        }
      },

      onDrop: (event) => {
        event.preventDefault();

        cleanupDrag();

        const draggedId =
          dragInfo.current.id;

        if (
          draggedId &&
          draggedId !== record.id
        ) {
          setItems((prev) =>
            reorderTree(
              sortTree(prev),
              draggedId,
              record.id
            )
          );
        }

        endDrag(
          event.currentTarget
        );
      },

      onDragEnd: (event) => {
        cleanupDrag();

        endDrag(
          event.currentTarget
        );
      },
    }),
    [
      levelOf,
      handleWheel,
      setIndicator,
      startAutoScroll,
      stopAutoScroll,
      cleanupDrag,
      endDrag,
    ]
  );

  /* =======================================================
   * SUBMIT
   * ======================================================= */

  const handleSubmit = useCallback(
    async () => {
      try {
        const values =
          await form.validateFields();

        const {
          name,
          description,
          parentId,
        } = values;

        if (editing) {
          const updated: SidebarItem =
          {
            ...editing,
            name: name.trim(),
            slug:
              editing.slug ||
              slugify(name.trim()),
            description:
              description?.trim() ||
              undefined,
          };

          const replaceInTree = (
            list: SidebarItem[]
          ): SidebarItem[] =>
            list.map((item) => {
              if (
                item.id === editing.id
              ) {
                return {
                  ...updated,
                  idx: item.idx,
                  children:
                    item.children,
                };
              }

              if (item.children) {
                return {
                  ...item,
                  children:
                    replaceInTree(
                      item.children
                    ),
                };
              }

              return item;
            });

          setItems(
            replaceInTree(items)
          );

          message.success(
            "Đã cập nhật mục sidebar"
          );

          setModalOpen(false);

          return;
        }

        const trimmedName =
          name.trim();

        const slug =
          slugify(trimmedName);

        const data =
          await createMutation.mutateAsync(
            {
              name: trimmedName,
              slug,
              description:
                description?.trim() ||
                undefined,
              parentId,
            }
          );

        const created: SidebarItem =
        {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description:
            data.description ??
            undefined,
          postCount:
            data.postCount ?? 0,
          topicIds: data.topicIds,
          idx: data.idx,
        };

        /*
         * API create đã lưu.
         * Không cần PUT replace ngay sau đó.
         */
        skipSaveRef.current = true;

        setItems(
          insertItem(
            items,
            created,
            parentId
          )
        );

        message.success(
          "Đã tạo mục sidebar"
        );

        setModalOpen(false);
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "errorFields" in err
        ) {
          return;
        }

        message.error(
          "Thao tác thất bại"
        );
      }
    },
    [
      form,
      editing,
      items,
      createMutation,
      message,
    ]
  );

  /* =======================================================
   * DELETE
   * ======================================================= */

  const handleDelete = useCallback(
    (item: SidebarItem) => {
      setItems((prev) =>
        removeItem(prev, item.id)
      );
    },
    []
  );

  /* =======================================================
   * COLUMNS
   * ======================================================= */

  const columns: TableProps<SidebarItem>["columns"] =
    useMemo(
      () => [
        {
          title: "",
          key: "drag",
          width: 40,

          render: (
            _: unknown,
            record: SidebarItem
          ) => (
            <span
              className={
                styles.dragHandle
              }
              title="Kéo để sắp xếp"
              aria-label={`Kéo để sắp xếp ${record.name}`}
              onMouseDown={
                enableRowDrag
              }
              onMouseUp={
                disableRowDrag
              }
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

          render: (
            name: string,
            record: SidebarItem
          ) => {
            const child = isChild(
              sorted,
              record.id
            );

            return (
              <div
                className={
                  styles.nameCell
                }
              >
                {child && (
                  <div
                    className={
                      styles.childSpacer
                    }
                    aria-hidden="true"
                  />
                )}

                <div
                  className={
                    child
                      ? styles.childName
                      : styles.itemName
                  }
                >
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

          render: (
            description:
              | string
              | undefined
          ) =>
            description ? (
              <span
                className={
                  styles.description
                }
              >
                {description}
              </span>
            ) : (
              <span
                className={
                  styles.noDescription
                }
              >
                —
              </span>
            ),
        },

        {
          title: "Cấp",
          key: "level",
          width: 100,

          render: (
            _: unknown,
            record: SidebarItem
          ) => (
            <Tag
              className={
                styles.levelTag
              }
            >
              {isChild(
                items,
                record.id
              )
                ? "Mục con"
                : "Mục cha"}
            </Tag>
          ),
        },

        {
          title: "Số topic",
          key: "topicCount",
          width: 100,

          render: (
            _: unknown,
            record: SidebarItem
          ) => (
            <span
              className={
                styles.topicCount
              }
            >
              {record.topicIds.length}
            </span>
          ),
        },

        {
          title: "Bài viết",
          key: "postCount",
          width: 110,

          render: (
            _: unknown,
            record: SidebarItem
          ) => (
            <span
              className={
                styles.postCount
              }
            >
              {totalPosts(record)}
            </span>
          ),
        },

        {
          title: "Thao tác",
          key: "actions",
          width: 240,

          render: (
            _: unknown,
            record: SidebarItem
          ) => {
            const child = isChild(
              sorted,
              record.id
            );

            return (
              <div
                className={
                  styles.actions
                }
              >
                {!child && (
                  <Tooltip title="Thêm mục con">
                    <Button
                      type="text"
                      icon={
                        <PlusOutlined />
                      }
                      onClick={() =>
                        openCreateChild(
                          record
                        )
                      }
                      aria-label={`Thêm mục con cho ${record.name}`}
                    />
                  </Tooltip>
                )}

                <Tooltip title="Tạo topic">
                  <Button
                    type="text"
                    icon={
                      <TagsOutlined />
                    }
                    onClick={() =>
                      openCreateTopic(
                        record
                      )
                    }
                    aria-label={`Tạo topic cho ${record.name}`}
                  />
                </Tooltip>

                <Tooltip title="Sửa">
                  <Button
                    type="text"
                    icon={
                      <EditOutlined />
                    }
                    onClick={() =>
                      openEdit(record)
                    }
                    aria-label={`Sửa ${record.name}`}
                  />
                </Tooltip>

                <Popconfirm
                  title="Xóa mục"
                  description={
                    record.children
                      ?.length
                      ? `Xóa "${record.name}" sẽ xóa luôn ${record.children.length} mục con.`
                      : `Bạn có chắc muốn xóa "${record.name}"?`
                  }
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{
                    danger: true,
                  }}
                  onConfirm={() =>
                    handleDelete(
                      record
                    )
                  }
                >
                  <Button
                    type="text"
                    danger
                    icon={
                      <DeleteOutlined />
                    }
                    aria-label={`Xóa ${record.name}`}
                  />
                </Popconfirm>
              </div>
            );
          },
        },
      ],
      [
        sorted,
        items,
        enableRowDrag,
        disableRowDrag,
        openCreateChild,
        openCreateTopic,
        openEdit,
        handleDelete,
      ]
    );

  /* =======================================================
   * RENDER
   * ======================================================= */

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.heading}>
            Quản lý Sidebar
          </h1>

          <div
            className={
              styles.headerActions
            }
          >
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
              Thêm mục
            </Button>
          </div>
        </div>

        <Table
          scroll={{
            x: 1290,
            y: "calc(100dvh - 250px)",
          }}
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isSearching && sidebarQuery.isLoading}
          pagination={false}
          indentSize={1}
          components={{
            body: {
              row: DragRow,
            },
          }}
          onRow={getRowProps}
          expandable={{
            defaultExpandAllRows: true,
            expandedRowKeys: keyword.trim()
              ? allParentIds
              : undefined,
            expandIconColumnIndex: 1,
          }}
        />
      </div>

      <Modal
        open={modalOpen}
        onCancel={() =>
          setModalOpen(false)
        }
        onOk={handleSubmit}
        confirmLoading={
          createMutation.isPending
        }
        okText={
          editing
            ? "Lưu thay đổi"
            : "Thêm mục"
        }
        cancelText="Hủy"
        title={
          editing
            ? "Sửa mục sidebar"
            : "Thêm mục sidebar"
        }
        destroyOnHidden
        afterOpenChange={(open) => {
          if (!open) {
            return;
          }

          if (editing) {
            const parent =
              findParent(
                sorted,
                editing.id
              );

            form.setFieldsValue({
              name: editing.name,
              description:
                editing.description,
              parentId:
                parent?.id,
            });
          } else {
            form.resetFields();

            if (draftParentId) {
              form.setFieldsValue({
                parentId:
                  draftParentId,
              });
            }
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              {
                required: true,
                message:
                  "Nhập tên mục",
              },
            ]}
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
                validator: (
                  _,
                  value: string | undefined
                ) => {
                  if (
                    editing?.children
                      ?.length &&
                    value
                  ) {
                    return Promise.reject(
                      new Error(
                        "Mục đang có mục con không thể trở thành mục con"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              options={
                parentOptions
              }
              allowClear
              placeholder="Chọn mục cha"
              disabled={Boolean(
                editing?.children
                  ?.length
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
