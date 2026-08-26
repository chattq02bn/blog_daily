"use client";

import { Provider } from "jotai";
import { useEffect, type ReactNode } from "react";
import { appStore } from "@/lib/jotai/store";
import { authUserAtom } from "@/lib/jotai/auth";
import { getStoredUser } from "@/lib/auth";

export default function JotaiProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    appStore.set(authUserAtom, getStoredUser());
  }, []);

  return <Provider store={appStore}>{children}</Provider>;
}
