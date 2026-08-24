import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout({
  children,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  return (
    <div className="isolate flex h-dvh flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1 lg:ml-4 lg:mt-2 mt-3">
        {!hideSidebar && <Sidebar />}
        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
