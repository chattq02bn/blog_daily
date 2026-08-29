"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Input, Popconfirm, Table, Tag, Tooltip, message } from "antd"; import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useDeletePost,
  usePosts,
} from "@/hooks/use-api";
import type { ApiPost } from "@/lib/api";
import styles from "./posts.module.scss";

const statusMeta: Record<"draft" | "published", { label: string; color: string }> = {
  draft: { label: "Nháp", color: "orange" },
  published: { label: "Đã đăng", color: "green" },
};

export default function AdminPostsPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const postsQuery = usePosts({ limit: 100 });
  const deleteMutation = useDeletePost();

  const posts: ApiPost[] = useMemo(() => postsQuery.data?.data ?? [], [postsQuery.data]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.id.toLowerCase().includes(kw) ||
        p.topics.some((t) => t.name.toLowerCase().includes(kw)) ||
        p.tags.some((t) => t.name.toLowerCase().includes(kw))
    );
  }, [posts, keyword]);

  const handleDelete = (post: ApiPost) => {
    deleteMutation.mutate(post.id, {
      onSuccess: () => message.success(`Đã xóa "${post.title}"`),
      onError: () => message.error("Xóa bài viết thất bại"),
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string) => <span className={styles.postId}>{id.slice(-8)}</span>,
    },
    {
      title: "Ảnh",
      dataIndex: "cover",
      key: "cover",
      width: 110,
      render: (cover: string | null, record: ApiPost) => (
        <Image
          src={cover || `https://picsum.photos/seed/${record.id}/360/220`}
          alt={record.title}
          width={72}
          height={45}
          className={styles.thumb}
          unoptimized
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string) => <span className={styles.postTitle}>{title}</span>,
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
          {record.topics.map((topic) => (
            <Tag key={topic.id} className={styles.itemTag}>
              {topic.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Tags",
      key: "tags",
      width: 200,
      render: (_: unknown, record: ApiPost) => (
        <div className={styles.list}>
          {record.tags.map((tag) => (
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
            <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${record.title}`} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Quản lý bài viết</h1>
          <div className={styles.headerActions}>
            <Input
              prefix={<SearchOutlined style={{ color: "var(--color-text-clickable-icon)" }} />}
              placeholder="Lọc theo tiêu đề, topic hoặc tag"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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
          dataSource={filtered}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          onRow={(record) => ({
            onDoubleClick: () => router.push(`/admin/create?id=${record.id}`),
          })}
        />
      </div>
    </AdminLayout>
  );
}