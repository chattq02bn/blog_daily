"use client";

import dynamic from "next/dynamic";

export const Editor = dynamic(() => import("./Editor"), { ssr: false });

export const PreviewEditor = dynamic(() => import("./PreviewEditor"), { ssr: false });
