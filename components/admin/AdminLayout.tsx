import Navbar from "../layout/Navbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="isolate flex h-dvh flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1 lg:ml-4 lg:mt-2">
        <AdminSidebar />
        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}