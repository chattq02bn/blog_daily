"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Upload,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { UploadChangeParam } from "antd/es/upload/interface";
import type { Block } from "@blocknote/core";
import AppLayout from "@/components/layout/AppLayout";
import { Editor, PreviewEditor } from "@/components/admin/DynamicEditor";
import {
  useCreatePost,
  usePost,
  useTags,
  useTopics,
  useUpdatePost,
} from "@/hooks/use-api";
import type { PostWriteBody } from "@/lib/api";
import styles from "./create.module.scss";

/* Nội dung được tính là có dữ liệu nếu tồn tại block chữ không rỗng
   hoặc block đặc biệt (ảnh, product card, bảng...) */
const hasContent = (blocks?: Block[]): boolean =>
  Boolean(
    blocks?.some((b) => {
      const t = b as Block & { content?: unknown; children?: Block[] };
      if (t.type === "paragraph" || t.type === "heading") {
        return Array.isArray(t.content)
          ? t.content.length > 0
          : hasContent(t.children);
      }
      return true;
    }),
  );

function CreateNoteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const topicsQuery = useTopics();
  const tagsQuery = useTags();
  const postQuery = usePost(editId ?? "");
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const topics = topicsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];

  const [form] = Form.useForm();
  const handleChange = useMemo(
    () =>
      debounce((blocks: Block[]) => {
        form.setFieldValue("body", blocks);
      }, 300),
    [form],
  );
  const [cover, setCover] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEdit = Boolean(editId);

  /* Nạp dữ liệu bài viết khi sửa */
  useEffect(() => {
    if (!editId || !postQuery.data) return;
    const post = postQuery.data;
    form.setFieldsValue({
      title: post.title,
      topicIds: post.topicIds,
      tagIds: post.tagIds,
      body: (post.bodyBlocks as Block[]) ?? [],
    });
    if (post.cover) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- chỉ đồng bộ một lần khi tải bài viết
      setCover(post.cover);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ nạp một lần khi có dữ liệu
  }, [editId, postQuery.data]);

  useEffect(() => () => handleChange.cancel(), [handleChange]);

  const openPreview = () => {
    handleChange.flush();
    const values = form.getFieldsValue();
    setPreviewTitle(values.title ?? "");
    setPreviewBlocks(values.body ?? []);
    setPreviewOpen(true);
  };

  const onUpload = (info: UploadChangeParam<UploadFile>) => {
    const file = info.fileList[0]?.originFileObj;
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      message.error("Ảnh bìa tối đa 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  };

  const applyCoverUrl = () => {
    if (coverUrl.trim()) setCover(coverUrl.trim());
  };

  const savePost = (
    navigateBack: boolean,
    validate: boolean,
    status: "draft" | "published",
  ) => {
    handleChange.flush();
    const persist = (values: { title: string; topicIds: string[]; tagIds: string[] }) => {
      const all = form.getFieldsValue(true);
      const body: PostWriteBody & { title: string } = {
        title: values.title?.trim() ?? "",
        topicIds: values.topicIds ?? [],
        tagIds: values.tagIds ?? [],
        bodyBlocks: (all.body ?? []) as Record<string, unknown>[],
        status,
        cover: cover || null,
      };
      if (!body.title) return;

      if (editId && updateMutation) {
        updateMutation.mutate(
          { id: editId, body },
          {
            onSuccess: () => {
              message.success(
                status === "draft" ? "Đã lưu bài viết vào danh sách nháp" : "Đã cập nhật bài viết",
              );
              if (navigateBack) router.push("/admin/posts");
            },
            onError: () => message.error("Lưu bài viết thất bại"),
          },
        );
      } else {
        createMutation.mutate(body, {
          onSuccess: () => {
            message.success(status === "draft" ? "Đã lưu bản nháp" : "Đã đăng bài");
            if (navigateBack) router.push("/admin/posts");
          },
          onError: () => message.error("Tạo bài viết thất bại"),
        });
      }
    };
    if (validate) {
      form
        .validateFields()
        .then(persist)
        .catch(() => { });
    } else {
      persist(form.getFieldsValue());
    }
  };

  /* Lưu nháp cũng phải validate như submit, chỉ lưu khi form hợp lệ */
  const saveDraft = () => savePost(false, true, "draft");

  const publish = () => {
    savePost(true, true, "published");
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/admin/posts");
    }
  };

  return (
    <AppLayout hideSidebar>
      <div className={styles.wrap}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className={styles.formWrap}
        >
          <div className={styles.grid}>
            <div className={styles.titleCol}>
              <Breadcrumb
                items={[
                  {
                    title: (
                      <span className={styles.backLink} onClick={goBack}>
                        <RollbackOutlined /> Quay lại
                      </span>
                    ),
                  },
                  { title: isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết" },
                ]}
              />
              <Form.Item
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input.TextArea
                  placeholder="Tiêu đề bài viết"
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className={styles.title}
                />
              </Form.Item>
            </div>
            <div className={styles.contentCol}>
              <Form.Item
                name="body"
                rules={[
                  {
                    validator: (_, value: Block[]) =>
                      hasContent(value)
                        ? Promise.resolve()
                        : Promise.reject(
                          new Error("Vui lòng nhập nội dung bài viết"),
                        ),
                  },
                ]}
              >
                <Editor onChange={handleChange} />
              </Form.Item>
            </div>

            <div className={styles.metaCol}>
              <Form.Item
                name="topicIds"
                rules={[
                  {
                    required: true,
                    type: "array",
                    min: 1,
                    message: "Vui lòng chọn ít nhất 1 topic",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn topics"
                  options={topics.map((t) => ({ value: t.id, label: t.name }))}
                  maxTagCount="responsive"
                  className={styles.metaSelect}
                />
              </Form.Item>
              <Form.Item
                name="tagIds"
                rules={[
                  {
                    required: true,
                    type: "array",
                    min: 1,
                    message: "Vui lòng chọn ít nhất 1 tag",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn tags"
                  options={tags.map((t) => ({ value: t.id, label: t.name }))}
                  maxTagCount="responsive"
                  className={styles.metaSelect}
                />
              </Form.Item>
            </div>

            <div className={styles.coverCol}>
              <div className={styles.coverRow}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={onUpload}
                >
                  <Button icon={<UploadOutlined />}>Tải ảnh bìa lên</Button>
                </Upload>
                <Input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  onPressEnter={applyCoverUrl}
                  placeholder="...hoặc dán link ảnh"
                  variant="borderless"
                  className={styles.coverInput}
                />
              </div>
              <div className={styles.coverPreview}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="Ảnh bìa" />
                ) : (
                  <span className={styles.coverPlaceholder}>
                    Ảnh bìa bài viết
                  </span>
                )}
              </div>
            </div>
          </div>
        </Form>

        <div className={styles.actionBar}>
          <Space wrap>
            <Button size="large" icon={<EyeOutlined />} onClick={openPreview}>
              Xem trước
            </Button>
            <Button size="large" loading={createMutation.isPending || updateMutation.isPending} onClick={saveDraft}>
              Lưu nháp
            </Button>
            <Button
              type="primary"
              size="large"
              loading={createMutation.isPending || updateMutation.isPending}
              className="note-btn-primary"
              onClick={publish}
            >
              {isEdit ? "Lưu thay đổi" : "Đăng bài"}
            </Button>
          </Space>
        </div>
      </div>

      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width="100%"
        title="Xem trước bài viết"
        footer={null}
        destroyOnHidden
        style={{
          top: 10,
          paddingBottom: 0,
        }}
        styles={{
          body: {
            height: "calc(100vh - 100px)",
            overflowY: "auto",
            padding: 0,
          },
        }}

      >
        <article className={`${styles.previewCard} ${styles.previewCardModal}`}>
          {cover && (
            <div className={styles.previewCover}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="Ảnh bìa" />
            </div>
          )}
          <h3 className={styles.previewHeading}>
            {previewTitle || "Tiêu đề bài viết của bạn"}
          </h3>
          <div className={styles.previewEditor}>
            <PreviewEditor blocks={previewBlocks} />
          </div>
        </article>
      </Modal>
    </AppLayout>
  );
}

export default function CreateNotePage() {
  return (
    <Suspense>
      <CreateNoteContent />
    </Suspense>
  );
}
