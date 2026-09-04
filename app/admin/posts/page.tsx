"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  App,
  Button,
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
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import SearchInput from "@/components/admin/SearchInput";
import NoImage from "@/components/ui/NoImage";
import {
  useDeletePost,
  usePosts,
  useTopics,
} from "@/hooks/use-api";
import type { ApiPost, ApiSidebarItem } from "@/lib/api";
import { sidebarApi } from "@/lib/api";
import styles from "./posts.module.scss";

const PAGE_SIZE = 20;

const statusMeta: Record<
  "draft" | "published",
  { label: string; color: string }
> = {
  draft: { label: "Nháp", color: "orange" },
  published: { label: "Đã đăng", color: "green" },
};

function flattenSidebarItems(items: ApiSidebarItem[]): { id: string; name: string; isChild: boolean }[] {
  const result: { id: string; name: string; isChild: boolean }[] = [];
  for (const item of items) {
    result.push({ id: item.id, name: item.name, isChild: false });
    for (const child of item.children ?? []) {
      result.push({ id: child.id, name: child.name, isChild: true });
    }
  }
  return result;
}

function AdminPostsContent() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const presetSidebarId = searchParams.get("sidebarId");
  const presetTopicId = searchParams.get("topicId");

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSidebarId, setSelectedSidebarId] = useState<string | null>(presetSidebarId);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(presetTopicId);

  const [sidebarOptions, setSidebarOptions] = useState<{ id: string; name: string; isChild: boolean }[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    sidebarApi.get().then((items) => {
      if (!cancelled) {
        setSidebarOptions(flattenSidebarItems(items));
        setSidebarLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setSidebarLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filteredTopicsQuery = useTopics(
    selectedSidebarId
      ? { sidebarId: selectedSidebarId }
      : { enabled: false }
  );
  const topics = filteredTopicsQuery.data?.data ?? [];

  const postsQuery = usePosts({
    page,
    limit: PAGE_SIZE,
    q: keyword || undefined,
    sidebarId: selectedSidebarId ?? undefined,
    topicId: selectedTopicId ?? undefined,
  });

  const deleteMutation = useDeletePost();

  const posts = postsQuery.data?.data ?? [];
  const meta = postsQuery.data?.meta;

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  const handleSidebarChange = useCallback((value: string | null) => {
    setSelectedSidebarId(value);
    setSelectedTopicId(null);
    setPage(1);
  }, []);

  const handleTopicChange = useCallback((value: string | null) => {
    setSelectedTopicId(value);
    setPage(1);
  }, []);

  const handleDelete = useCallback(
    (post: ApiPost) => {
      deleteMutation.mutate(post.id, {
        onSuccess: () => message.success(`Đã xóa "${post.title}"`),
        onError: () => message.error("Xóa bài viết thất bại"),
      });
    },
    [deleteMutation, message]
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: string) => (
          <span className={styles.postId}>{id.slice(-8)}</span>
        ),
      },
      {
        title: "Ảnh",
        dataIndex: "cover",
        key: "cover",
        width: 110,
        render: (cover: string | null, record: ApiPost) =>
          cover ? (
            <Image
              src={cover}
              alt={record.title}
              width={72}
              height={45}
              className={styles.thumb}
              unoptimized
            />
          ) : (
            <div style={{ width: 72, height: 45, borderRadius: 6, overflow: "hidden" }}>
              <NoImage />
            </div>
          ),
      },
      {
        title: "Tiêu đề",
        dataIndex: "title",
        key: "title",
        ellipsis: true,
        render: (title: string) => (
          <span className={styles.postTitle}>{title}</span>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: "draft" | "published") => {
          const meta = statusMeta[status ?? "draft"];
          return <Tag color={meta.color}>{meta.label}</Tag>;
        },
      },
      {
        title: "Topics",
        key: "topics",
        width: 240,
        render: (_: unknown, record: ApiPost) => (
          <div className={styles.list}>
            {record.topics?.map((topic) => (
              <Tag key={topic.id} className={styles.itemTag}>
                {topic.name}
              </Tag>
            ))}
          </div>
        ),
      },
      {
        title: "Sidebar",
        key: "sidebar",
        width: 150,
        render: (_: unknown, record: ApiPost) =>
          record.sidebar ? (
            <Tag color="blue">{record.sidebar.name}</Tag>
          ) : (
            <span style={{ color: "#999" }}>—</span>
          ),
      },
      {
        title: "Tags",
        key: "tags",
        width: 200,
        render: (_: unknown, record: ApiPost) => (
          <div className={styles.list}>
            {record.tags?.map((tag) => (
              <Tag key={tag.id} className={styles.itemTag}>
                #{tag.name}
              </Tag>
            ))}
          </div>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 140,
        render: (_: unknown, record: ApiPost) => (
          <div className={styles.actions}>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/create?id=${record.id}`)}
                aria-label={`Chỉnh sửa ${record.title}`}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa bài viết"
              description={`Bạn có chắc muốn xóa "${record.title}"?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Xóa ${record.title}`}
              />
            </Popconfirm>
          </div>
        ),
      },
    ],
    [router, handleDelete]
  );

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Quản lý bài viết</h1>

          <Select
            showSearch
            placeholder="Chọn sidebar"
            optionFilterProp="label"
            allowClear
            value={selectedSidebarId}
            onChange={handleSidebarChange}
            options={sidebarOptions.map((item) => ({
              value: item.id,
              label: item.isChild ? `\u00A0\u00A0${item.name}` : item.name,
            }))}
            notFoundContent={sidebarLoading ? "Đang tải..." : "Không có dữ liệu"}
            className={styles.filterSelect}
          />
          <Select
            placeholder={selectedSidebarId ? "Chọn topic" : "Chọn sidebar trước"}
            allowClear
            value={selectedTopicId}
            onChange={handleTopicChange}
            options={topics.map((t) => ({ value: t.id, label: t.name }))}
            disabled={!selectedSidebarId}
            notFoundContent={filteredTopicsQuery.isPending ? "Đang tải..." : "Không có topic"}
            className={styles.filterSelect}
          />
          <div className={styles.actions}>
            <SearchInput
              placeholder="Lọc theo tiêu đề"
              onSearch={handleSearch}
              className={styles.search}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className={styles.addBtn}
              onClick={() => router.push("/admin/create")}
            >
              Thêm bài viết
            </Button>
          </div>
        </div>

        <Table
          scroll={{ x: "max-content", y: "calc(100dvh - 300px)" }}
          rowKey="id"
          columns={columns}
          dataSource={posts}
          loading={postsQuery.isLoading || postsQuery.isFetching}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: meta?.total ?? 0,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          onRow={(record) => ({
            onDoubleClick: () => router.push(`/admin/create?id=${record.id}`),
          })}
        />
      </div>
    </AdminLayout>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense>
      <AdminPostsContent />
    </Suspense>
  );
}
