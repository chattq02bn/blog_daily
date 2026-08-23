"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { BlockNoteSchema } from "@blocknote/core";

export const ProductBlock = createReactBlockSpec(
  {
    type: "productCard",

    propSchema: {
      badge: {
        default: "SẢN PHẨM MỚI",
      },

      title: {
        default: "Tên sản phẩm",
      },

      description: {
        default:
          "Mô tả chi tiết về sản phẩm. Đây là nơi bạn có thể giới thiệu những đặc điểm nổi bật, công dụng và ưu điểm của sản phẩm.",
      },

      price: {
        default: "1.990.000đ",
      },

      oldPrice: {
        default: "2.490.000đ",
      },

      discount: {
        default: "-20%",
      },

      imageUrl: {
        default: "",
      },

      buttonText: {
        default: "Mua ngay",
      },

      buttonUrl: {
        default: "#",
      },

      feature1: {
        default: "✓ Chính hãng 100%",
      },

      feature2: {
        default: "✓ Bảo hành 12 tháng",
      },

      feature3: {
        default: "✓ Miễn phí vận chuyển",
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
      const {
        badge,
        title,
        description,
        price,
        oldPrice,
        discount,
        imageUrl,
        buttonText,
        buttonUrl,
        feature1,
        feature2,
        feature3,
      } = props.block.props;

      const readOnly = !props.editor.isEditable;

      /* =====================================================
         UPDATE HELPERS
      ===================================================== */

      const updateProp = (
        key:
          | "badge"
          | "title"
          | "description"
          | "price"
          | "oldPrice"
          | "discount"
          | "imageUrl"
          | "buttonText"
          | "buttonUrl"
          | "feature1"
          | "feature2"
          | "feature3",
        value: string
      ) => {
        if (readOnly) return;

        props.editor.updateBlock(props.block, {
          props: {
            [key]: value,
          },
        });
      };

      return (
        <div
          style={{
            width: "100%",
            maxWidth: "850px",
            margin: "20px 0",

            display: "flex",

            border: "1px solid #e5e7eb",
            borderRadius: "16px",

            background: "#ffffff",

            overflow: "hidden",

            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.07)",
          }}
        >
          {/* LEFT - PRODUCT CONTENT */}

          <div
            style={{
              width: "58%",

              padding: "30px",

              boxSizing: "border-box",

              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* BADGE */}

            <input
              value={badge}
              onChange={(e) => updateProp("badge", e.target.value)}
              placeholder="Nhãn sản phẩm"
              readOnly={readOnly}
              style={{
                alignSelf: "flex-start",

                marginBottom: "14px",

                padding: "5px 10px",

                border: "none",
                borderRadius: "20px",

                outline: "none",

                background: "#fff1f0",

                color: "#ff4d4f",

                fontSize: "11px",

                fontWeight: 700,

                letterSpacing: "0.3px",
              }}
            />

            {/* TITLE */}

            <input
              value={title}
              onChange={(e) => updateProp("title", e.target.value)}
              placeholder="Tên sản phẩm"
              readOnly={readOnly}
              style={{
                width: "100%",

                marginBottom: "12px",

                padding: 0,

                border: "none",
                outline: "none",

                background: "transparent",

                fontSize: "27px",

                lineHeight: 1.3,

                fontWeight: 700,

                color: "#111827",

                boxSizing: "border-box",
              }}
            />

            {/* DESCRIPTION */}

            <textarea
              value={description}
              onChange={(e) => updateProp("description", e.target.value)}
              placeholder="Mô tả sản phẩm..."
              rows={4}
              readOnly={readOnly}
              style={{
                width: "100%",

                marginBottom: "18px",

                padding: 0,

                border: "none",
                outline: "none",

                resize: "none",

                background: "transparent",

                fontFamily: "inherit",

                fontSize: "14px",

                lineHeight: 1.7,

                color: "#6b7280",

                boxSizing: "border-box",
              }}
            />

            {/* FEATURES */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",

                gap: "7px",

                marginBottom: "22px",
              }}
            >
              <input
                value={feature1}
                onChange={(e) => updateProp("feature1", e.target.value)}
                readOnly={readOnly}
                style={{
                  width: "100%",

                  padding: "0",

                  border: "none",
                  outline: "none",

                  background: "transparent",

                  fontSize: "13px",

                  color: "#374151",
                }}
              />

              <input
                value={feature2}
                onChange={(e) => updateProp("feature2", e.target.value)}
                readOnly={readOnly}
                style={{
                  width: "100%",

                  padding: "0",

                  border: "none",
                  outline: "none",

                  background: "transparent",

                  fontSize: "13px",

                  color: "#374151",
                }}
              />

              <input
                value={feature3}
                onChange={(e) => updateProp("feature3", e.target.value)}
                readOnly={readOnly}
                style={{
                  width: "100%",

                  padding: "0",

                  border: "none",
                  outline: "none",

                  background: "transparent",

                  fontSize: "13px",

                  color: "#374151",
                }}
              />
            </div>

            {/* PRICE */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "10px",

                marginBottom: "20px",
              }}
            >
              <input
                value={price}
                onChange={(e) => updateProp("price", e.target.value)}
                placeholder="Giá bán"
                readOnly={readOnly}
                style={{
                  width: "150px",

                  padding: 0,

                  border: "none",
                  outline: "none",

                  background: "transparent",

                  fontSize: "23px",

                  fontWeight: 700,

                  color: "#ff4d4f",
                }}
              />

              <input
                value={oldPrice}
                onChange={(e) => updateProp("oldPrice", e.target.value)}
                placeholder="Giá cũ"
                readOnly={readOnly}
                style={{
                  width: "110px",

                  padding: 0,

                  border: "none",
                  outline: "none",

                  background: "transparent",

                  fontSize: "13px",

                  color: "#9ca3af",

                  textDecoration: "line-through",
                }}
              />

              <input
                value={discount}
                onChange={(e) => updateProp("discount", e.target.value)}
                placeholder="-20%"
                readOnly={readOnly}
                style={{
                  width: "55px",

                  padding: "4px 7px",

                  border: "none",
                  outline: "none",

                  borderRadius: "5px",

                  background: "#fff1f0",

                  color: "#ff4d4f",

                  fontSize: "12px",

                  fontWeight: 600,

                  textAlign: "center",
                }}
              />
            </div>

            {/* BUY BUTTON */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                }}
                style={{
                  padding: "11px 25px",

                  border: "none",

                  borderRadius: "8px",

                  background: "#1677ff",

                  color: "#ffffff",

                  fontSize: "14px",

                  fontWeight: 600,

                  cursor: "pointer",

                  boxShadow: "0 3px 8px rgba(22,119,255,0.25)",
                }}
              >
                {buttonText}
              </button>

              <input
                value={buttonText}
                onChange={(e) => updateProp("buttonText", e.target.value)}
                placeholder="Tên nút"
                readOnly={readOnly}
                style={{
                  width: "100px",

                  padding: "7px 9px",

                  border: "1px solid #d9d9d9",

                  borderRadius: "6px",

                  outline: "none",

                  fontSize: "12px",
                }}
              />
            </div>

            {/* BUTTON URL */}

            <input
              value={buttonUrl}
              onChange={(e) => updateProp("buttonUrl", e.target.value)}
              placeholder="Link mua hàng..."
              readOnly={readOnly}
              style={{
                width: "100%",

                marginTop: "12px",

                padding: "7px 9px",

                border: "1px solid #e5e7eb",

                borderRadius: "6px",

                outline: "none",

                fontSize: "12px",

                color: "#6b7280",

                boxSizing: "border-box",
              }}
            />
          </div>

          {/* RIGHT - PRODUCT IMAGE */}

          <div
            style={{
              width: "42%",

              minHeight: "390px",

              position: "relative",

              background: "#f7f8fa",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              overflow: "hidden",
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: "100%",

                  height: "100%",

                  minHeight: "390px",

                  objectFit: "cover",

                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",

                  height: "100%",

                  minHeight: "390px",

                  display: "flex",

                  flexDirection: "column",

                  alignItems: "center",

                  justifyContent: "center",

                  color: "#9ca3af",
                }}
              >
                <div
                  style={{
                    fontSize: "50px",

                    marginBottom: "10px",
                  }}
                >
                  🛍️
                </div>

                <div
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Hình ảnh sản phẩm
                </div>
              </div>
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
  },
});
