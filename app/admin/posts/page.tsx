"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  App,
  Button,
  Popconfirm,
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
} from "@/hooks/use-api";
import type { ApiPost } from "@/lib/api";
import styles from "./posts.module.scss";

const PAGE_SIZE = 20;

const statusMeta: Record<
  "draft" | "published",
  { label: string; color: string }
> = {
  draft: { label: "Nháp", color: "orange" },
  published: { label: "Đã đăng", color: "green" },
};

export default function AdminPostsPage() {
  const { message } = App.useApp();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const postsQuery = usePosts({
    page,
    limit: PAGE_SIZE,
    q: keyword || undefined,
  });

  const deleteMutation = useDeletePost();

  const posts = postsQuery.data?.data ?? [];
  const meta = postsQuery.data?.meta;

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
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

          <div className={styles.headerActions}>
            <SearchInput
              placeholder="Lọc theo tiêu đề, topic hoặc tag"
              onSearch={handleSearch}
              className={styles.search}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="note-btn-primary"
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
