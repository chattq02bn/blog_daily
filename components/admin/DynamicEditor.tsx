"use client";

import dynamic from "next/dynamic";
import EditorLoading from "./EditorLoading";

export const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

export const PreviewEditor = dynamic(() => import("./PreviewEditor"), {
  ssr: false,
  loading: () => <EditorLoading />,
});
