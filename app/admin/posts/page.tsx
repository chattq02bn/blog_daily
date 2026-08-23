"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Popconfirm, Table, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import type { AdminTopic, AdminTag } from "@/data/admin";
import { loadPosts, loadTags, loadTopics, type AdminPost } from "@/lib/adminStorage";
import styles from "./posts.module.scss";

function nameOf(list: AdminTopic[] | AdminTag[], id: string): string | undefined {
  return list.find((item) => item.id === id)?.name;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được ở client sau khi mount
    setPosts(loadPosts());
  }, []);

  const topics = useMemo(() => loadTopics(), []);
  const tags = useMemo(() => loadTags(), []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.id.toLowerCase().includes(kw) ||
        p.topicIds.some((id) => nameOf(topics, id)?.toLowerCase().includes(kw)) ||
        p.tagIds.some((id) => nameOf(tags, id)?.toLowerCase().includes(kw))
    );
  }, [posts, keyword, topics, tags]);

  const handleDelete = (post: AdminPost) => {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    console.log("delete post:", post);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (id: string) => <span className={styles.postId}>{id}</span>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string) => <span className={styles.postTitle}>{title}</span>,
    },
    {
      title: "Topics",
      dataIndex: "topicIds",
      key: "topicIds",
      width: 240,
      render: (topicIds: string[]) => (
        <div className={styles.list}>
          {topicIds.map((id) => (
            <Tag key={id} className={styles.itemTag}>
              {nameOf(topics, id) ?? id}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tagIds",
      key: "tagIds",
      width: 200,
      render: (tagIds: string[]) => (
        <div className={styles.list}>
          {tagIds.map((id) => (
            <Tag key={id} className={styles.itemTag}>
              #{nameOf(tags, id) ?? id}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_: unknown, record: AdminPost) => (
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
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </div>
    </AdminLayout>
  );
}