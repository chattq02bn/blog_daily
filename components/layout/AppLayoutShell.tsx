"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const hideNavbar = pathname === "/admin/create";

  return (
    <div className="isolate flex h-dvh flex-col">
      {/* Desktop: Navbar bình thường. Mobile: ẩn Navbar, dùng mobileToolbar từ Editor */}
      <div className={hideNavbar ? "hidden lg:block" : ""}>
        <Navbar />
      </div>
      {mobileToolbar && (
        <div className="lg:hidden">
          {mobileToolbar}
        </div>
      )}
      <div className="flex min-h-0 flex-1 lg:ml-4">
        {!hideSidebar && <Sidebar />}
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-x-clip overflow-y-auto max-lg:pt-[56px]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
