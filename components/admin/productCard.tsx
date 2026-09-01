"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { BlockNoteSchema } from "@blocknote/core";
import { uploadApi } from "@/lib/api";
import styles from "./productCard.module.scss";
import { ContentBlock } from "./contentBlock";

export const ProductBlock = createReactBlockSpec(
  {
    type: "productCard",

    propSchema: {
      title: {
        default: "",
      },

      description: {
        default: "",
      },

      imageUrl: {
        default: "",
      },

      buttonText: {
        default: "",
      },

      buttonUrl: {
        default: "",
      },
    },

    /*
     * Card không chứa các BlockNote block con.
     * Toàn bộ nội dung được lưu trong props.
     */
    content: "none",
  },

  {
    render: (props) => {
      const { title, description, imageUrl, buttonText, buttonUrl } =
        props.block.props;

      const readOnly = !props.editor.isEditable;

      /* =====================================================
         UPDATE HELPERS
      ===================================================== */

      const updateProp = (
        key: "title" | "description" | "imageUrl" | "buttonText" | "buttonUrl",
        value: string,
      ) => {
        if (readOnly) return;

        props.editor.updateBlock(props.block, {
          props: {
            [key]: value,
          },
        });
      };

      /* Mở hộp chọn file mà không cần hook (render() không phải component) */
      const openFilePicker = () => {
        if (readOnly) return;

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
          const file: File | undefined | null = input.files?.[0];
          if (!file) return;
          try {
            const result = await uploadApi.uploadFile(file);
            updateProp("imageUrl", result.url);
          } catch {
            /* bỏ qua lỗi upload */
          }
        };

        input.click();
      };

      return (
        <div
          data-product-card=""
          className={`${styles.card} ${readOnly ? styles.preview : ""}`}
        >
          {/* LEFT - THÔNG TIN SẢN PHẨM */}

          <div
            className={`${styles.info} ${readOnly ? styles.previewInfo : ""}`}
          >
            {/* NHÓM TRÊN: TÊN + MÔ TẢ */}

            <div className={styles.infoTop}>
              {/* TITLE — khi xem: xuống dòng tối đa 2 dòng */}

              {readOnly ? (
                <div className={styles.titleView}>{title}</div>
              ) : (
                <input
                  className={styles.title}
                  value={title}
                  onChange={(e) => updateProp("title", e.target.value)}
                  placeholder="Tên sản phẩm"
                />
              )}

              {/* DESCRIPTION — hiển thị tối đa 3 dòng khi xem */}

              {readOnly ? (
                description && <p className={styles.desc}>{description}</p>
              ) : (
                <textarea
                  className={styles.descInput}
                  value={description}
                  onChange={(e) => updateProp("description", e.target.value)}
                  placeholder="Mô tả ngắn về sản phẩm..."
                  rows={3}
                  readOnly={readOnly}
                />
              )}
            </div>

            {/* NHÓM DƯỚI: NÚT MUA — luôn nằm cuối cột, giãn cách với nhóm trên */}

            <div className={styles.infoBottom}>
              {readOnly && buttonUrl ? (
                <a
                  className={styles.btn}
                  href={buttonUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {buttonText}
                </a>
              ) : (
                <button type="button" className={styles.btn}>
                  {buttonText}
                </button>
              )}

              {!readOnly && (
                <div className={styles.tools}>
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={openFilePicker}
                  >
                    ⬆ Tải ảnh lên
                  </button>

                  <input
                    className={styles.tiny}
                    style={{ width: "100%" }}
                    value={buttonText}
                    onChange={(e) => updateProp("buttonText", e.target.value)}
                    placeholder="Tên nút..."
                  />

                  {/* Gán link cho nút mua — hiển thị trống khi đang là "#" */}

                  <input
                    className={styles.tiny}
                    style={{ width: "100%" }}
                    value={buttonUrl}
                    onChange={(e) => updateProp("buttonUrl", e.target.value)}
                    placeholder="Gán link cho nút mua hàng..."
                  />

                  <input
                    className={styles.tiny}
                    style={{ width: "100%" }}
                    value={imageUrl}
                    onChange={(e) => updateProp("imageUrl", e.target.value)}
                    placeholder="Hoặc dán link ảnh sản phẩm..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - ẢNH SẢN PHẨM */}

          <div className={styles.imgWrap}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={title} className={styles.img} />
            ) : (
              <span className={styles.imgPlaceholder}>🛍️</span>
            )}
          </div>
        </div>
      );
    },
  }
);

export const productCardSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    productCard: ProductBlock(),
    contentBlock: ContentBlock(),
  },
});
