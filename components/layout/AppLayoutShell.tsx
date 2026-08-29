"use client";

import { type ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayoutShell({
  children,
  hideSidebar = false,
  mobileToolbar,
}: {
  children: ReactNode;
  hideSidebar?: boolean;
  mobileToolbar?: ReactNode;
}) {
  return (
    <div className="isolate flex h-dvh flex-col">
      {/* Desktop: Navbar bình thường. Mobile: ẩn Navbar, dùng mobileToolbar từ Editor */}
      <div className="hidden max-lg:hidden lg:block">
        <Navbar />
      </div>
      {mobileToolbar && (
        <div className="lg:hidden">
          {mobileToolbar}
        </div>
      )}
      <div className="flex min-h-0 flex-1 lg:ml-4 lg:mt-2 mt-3">
        {!hideSidebar && <Sidebar />}
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-x-clip overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
