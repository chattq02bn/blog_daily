"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { BlockNoteSchema } from "@blocknote/core";
import styles from "./contentBlock.module.scss";

export const ContentBlock = createReactBlockSpec(
  {
    type: "contentBlock",

    propSchema: {},

    content: "inline",
  },
  {
    render: (props) => {
      const readOnly = !props.editor.isEditable;

      return (
        <div
          data-content-block=""
          className={`${styles.block} ${readOnly ? styles.preview : ""}`}
          ref={props.contentRef}
        />
      );
    },
  }
);

export const contentBlockSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    contentBlock: ContentBlock(),
  },
});
