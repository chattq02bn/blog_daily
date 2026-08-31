"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayoutShell({
  children,
  hideSidebar = false,
  actionBar,
}: {
  children: ReactNode;
  hideSidebar?: boolean;
  actionBar?: ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/admin/create";

  return (
    <div className="isolate flex h-dvh flex-col">
      <div className={hideNavbar ? "hidden lg:block" : ""}>
        <Navbar />
      </div>
      {/* Mobile: actionBar at top on create page */}
      {hideNavbar && actionBar && (
        <div
          className="lg:hidden shrink-0 border-t border-[var(--color-border-default)] bg-[var(--color-surface-normal)] px-3 flex justify-end items-center border-b"
          style={{ paddingTop: 10, paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
        >
          {actionBar}
        </div>
      )}
      <div className="flex min-h-0 flex-1 lg:ml-4">
        {!hideSidebar && <Sidebar />}
        <main
          id="main-content"
          className={`min-h-0 flex-1 overflow-x-clip overflow-y-auto ${hideNavbar
            ? "max-lg:pb-[56px]"
            : ""
            }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
