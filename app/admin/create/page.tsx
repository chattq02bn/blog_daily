"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
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
  loadPosts,
  loadTags,
  loadTopics,
  savePosts,
  type AdminPost,
} from "@/lib/adminStorage";
import styles from "./create.module.scss";

function CreateNoteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [topics] = useState(() => loadTopics());
  const [tags] = useState(() => loadTags());
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

  useEffect(() => {
    if (!editId) return;
    const post = loadPosts().find((p) => p.id === editId);
    if (post) {
      form.setFieldsValue({
        title: post.title,
        topicIds: post.topicIds,
        tagIds: post.tagIds,
        body: post.bodyBlocks ?? [],
      });
    }
  }, [editId, form]);

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
    if (file) setCover(URL.createObjectURL(file));
  };

  const applyCoverUrl = () => {
    if (coverUrl.trim()) setCover(coverUrl.trim());
  };

  const savePost = (navigateBack: boolean, validate: boolean) => {
    handleChange.flush();
    const persist = (values: {
      title: string;
      topicIds: string[];
      tagIds: string[];
    }) => {
      const all = form.getFieldsValue(true);
      const data = {
        title: values.title?.trim() ?? "",
        topicIds: values.topicIds ?? [],
        tagIds: values.tagIds ?? [],
        bodyBlocks: all.body ?? [],
      };
      if (editId) {
        const posts = loadPosts().map((p) =>
          p.id === editId ? { ...p, ...data } : p,
        );
        savePosts(posts);
        console.log("update post:", { id: editId, ...data });
      } else {
        const created: AdminPost = {
          id: `p_${Date.now().toString(36)}`,
          ...data,
        };
        savePosts([created, ...loadPosts()]);
        console.log("create post:", created);
      }
      if (navigateBack) router.push("/admin/posts");
    };
    if (validate) {
      form
        .validateFields()
        .then(persist)
        .catch(() => {});
    } else {
      persist(form.getFieldsValue());
    }
  };

  const publish = () => {
    savePost(true, true);
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
        <div className={styles.topBar}>
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
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className={styles.formWrap}
        >
          <div className={styles.grid}>
            <div className={styles.imageCol}>
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

            <div className={styles.contentCol}>
              <Form.Item name="body">
                <Editor onChange={handleChange} />
              </Form.Item>
            </div>
          </div>
        </Form>

        <div className={styles.actionBar}>
          <Space>
            <Button size="large" icon={<EyeOutlined />} onClick={openPreview}>
              Xem trước
            </Button>
            <Button size="large" onClick={() => savePost(false, false)}>
              Lưu nháp
            </Button>
            <Button
              type="primary"
              size="large"
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
